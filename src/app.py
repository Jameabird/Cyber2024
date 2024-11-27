from flask import request,Flask,jsonify
from flask_cors import CORS,cross_origin
import pymongo
from argon2 import PasswordHasher 
from argon2.exceptions import VerifyMismatchError
import secrets
import re
from datetime import datetime, timedelta
import requests
import smtplib
from email.mime.text import MIMEText
from itsdangerous import URLSafeTimedSerializer
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature

# สร้างตัวแปร PasswordHasher
ph = PasswordHasher()

# การเชื่อมต่อกับ MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["cyber"]  # แทนที่ด้วยชื่อฐานข้อมูลของคุณ
collection = db["cyber.user"]            # แทนที่ด้วยชื่อคอลเลกชันของคุณ
counters_collection = db["cyber.counters"]
log_collection = db["cyber.login_logs"]   # คอลเลกชันสำหรับเก็บ log
salt_collection = db["cyber.salt"]
# ข้อมูลผู้ใช้
global use  # กำหนดชื่อผู้ใช้



def is_strong_username(username):
    """ตรวจสอบว่าชื่อผู้ใช้แข็งแรงหรือไม่"""
    if len(username) < 5:
        return False, "username length more than 5"
        
    if not re.match("^[a-zA-Z0-9_]+$", username):
        return False, "username include only letter and number"
        
    return True, ""






def is_strong_password(password):
    """ตรวจสอบว่ารหัสผ่านแข็งแรงหรือไม่"""
    if len(password) < 12:
        return False, "password length could be more than 12 "
        
    if not re.search(r"[A-Z]", password):  # มีตัวอักษรพิมพ์ใหญ่
        return False, "password should have uperpcase"
        
    if not re.search(r"[a-z]", password):  # มีตัวอักษรพิมพ์เล็ก
        return False, "password should have lowercase"
        
    if not re.search(r"[0-9]", password):  # มีตัวเลข
        return False, "password should have number"
        
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):  # มีสัญลักษณ์พิเศษ
        return False, "password should special character"
    
    return True, ""   
    

def is_password_expired(username):
    
    user = collection.find_one({"username": username})
    if user:
        last_password_change = user.get("last_password_change")
        if last_password_change:
            # ตรวจสอบว่าผ่านไป 90 วันแล้วหรือยัง
            if datetime.utcnow() - last_password_change > timedelta(days=90): #days=90
                print(datetime.utcnow() - last_password_change )
                return True ,"Password expired (more than 90 day)"
    print(datetime.utcnow() - last_password_change )        
    return False, "non expired"


def change_password(username, new_password):
    
        if is_strong_password(new_password):
            # เปลี่ยนรหัสผ่าน
            # (โค้ดสำหรับการแฮชรหัสผ่านที่ใหม่ตามที่ต้องการ)
         salt = secrets.token_hex(32)
         hashed_password = ph.hash(new_password+salt)  # แฮชรหัสผ่านใหม่ด้วย Argon2
         
         # อัปเดตรหัสผ่านและวันที่เปลี่ยนรหัสผ่าน
         collection.update_one(
            {"username": username},
            {"$set": {"hashed_password": hashed_password, "last_password_change": datetime.utcnow()}}
        )
         salt_collection.update_one(
            {"username": username},
            {"$set": {"salt":salt}}
        )
         return True,"reset success"
        
       
    


def get_location():
    api_key = 'b45947f7bd8c448b8ec5fb4bf75139dd'  # b45947f7bd8c448b8ec5fb4bf75139dd
    url = f'https://api.ipgeolocation.io/ipgeo?apiKey={api_key}'
    response = requests.get(url)
    data = response.json()

    if response.status_code == 200:
        ip = data.get('ip', 'Unknown')
        city = data.get('city', 'Unknown')
        country = data.get('country_name', 'Unknown')
        return ip, city, country
    else:
        return 'Unknown', 'Unknown', 'Unknown'
    
    
def log_login_attempt(username, success):
    """ฟังก์ชันบันทึก log การเข้าสู่ระบบ"""
     
    # หาที่ตั้งทางภูมิศาสตร์จาก IP (ถ้ามี)
    ip, city, country = get_location()
    
    # สร้าง entry สำหรับบันทึก log
    log_entry = {
        "username": username,
        "timestamp": datetime.utcnow(),  # เวลาปัจจุบันในรูป UTC
        "success": success,
        "ip_address": ip,
        "location": {
            "city": city,
            "country": country
        },
        
    }
    
    # บันทึกข้อมูล log ลงใน MongoDB
    log_collection.insert_one(log_entry)


def get_next_user_id():
    counter = counters_collection.find_one_and_update(
        {"_id": "user_id"},
        {"$inc": {"sequence_value": 1}},
        upsert=True,
        return_document=pymongo.ReturnDocument.AFTER
    )
    return counter["sequence_value"]

if counters_collection.count_documents({"_id": "user_id"}) == 0:
    counters_collection.insert_one({"_id": "user_id", "sequence_value": 0})

def register(username, password, email):
    """ฟังก์ชันสำหรับการลงทะเบียนผู้ใช้"""
    username_valid, username_message = is_strong_username(username)
    if not username_valid:
        return False, username_message
    
    # ตรวจสอบว่าชื่อผู้ใช้มีอยู่ในฐานข้อมูลหรือไม่
    if collection.find_one({"username": username}):
        return False, "username already used"
    
    if collection.find_one({"email": email}):
        return False, "email already used"
       
    # ตรวจสอบรหัสผ่าน
    password_valid, password_message = is_strong_password(password)
    if not password_valid:
        return False, password_message
    
    # สร้าง salt
    salt = secrets.token_hex(32)  # สร้าง salt แบบสุ่ม

    # แฮชรหัสผ่านด้วย Argon2
    hashed_password = ph.hash(password + salt)
    user_id = get_next_user_id()#collection.count_documents({}) + 1   ตัวอย่างการสร้าง user_id
    # สร้างเอกสารที่จะเพิ่มลงในฐานข้อมูล
    user_data = {
        "user_id": user_id,
        "username": username,
        "hashed_password": hashed_password,
        "email": email,
        "last_password_change": datetime.utcnow(),
        'failed_attempts': 0,
        'locked_until': None
    }
    salt_data = {
        "user_id": user_id,
        "username": username,
        "salt": salt 
    }

    # เพิ่มข้อมูลลงใน MongoDB
    try:
        collection.insert_one(user_data)
        salt_collection.insert_one(salt_data)
        return True, "Registration successful!"
    except Exception as e:
        return False, f"An error occurred: {e}"


def login(username, password):
    # ค้นหาผู้ใช้ในฐานข้อมูล
    user = collection.find_one({"username": username})
    salt_db = salt_collection.find_one({"username": username})
    if user:
        if user['locked_until'] and datetime.utcnow() < user['locked_until']:
          return False, "you try too much try again in later"
        

        # นำ salt ที่เก็บไว้มาใช้
        salt = salt_db["salt"]
        
        # ตรวจสอบรหัสผ่านที่ผู้ใช้ป้อน
        try:
            # นำ salt มาผสมกับรหัสผ่านที่ผู้ใช้ป้อน
            if ph.verify(user["hashed_password"], password + salt):
                collection.update_one(
                {"username": username},
                {"$set": {'failed_attempts':0}}
             ) 
                
                
                log_login_attempt(username, True)  # บันทึก log สำเร็จ
                # ที่นี่คุณสามารถสร้าง session หรือ token สำหรับผู้ใช้ได้
                return True, "Login successful!"
            
                
        except VerifyMismatchError:
            print("Incorrect password.")
            log_login_attempt(username, False)
            collection.update_one(
                {"username": username},
                {"$inc": {'failed_attempts': 1}}
              )
            if user['failed_attempts'] >= 5:
                 lock = datetime.utcnow() + timedelta(minutes=60)
                 collection.update_one(
                {"username": username},
                {"$set": {'locked_until': lock}}
              )
                 print({user["locked_until"]})
                 
            return False, "username or password wrong"
            
           
    else:
        return False, "password or username wrong" #user not found

s = URLSafeTimedSerializer(secrets.token_hex(16))
def generate_reset_token(user_email):
    
    """สร้าง token สำหรับการรีเซ็ตรหัสผ่าน"""
    token = s.dumps(user_email, salt='password-reset-salt')
    return token

def verify_reset_token(token, max_age=3600):
    """ตรวจสอบ token และกำหนดระยะเวลาของ token (default: 1 ชั่วโมง)"""
    try:
        email = s.loads(token, salt='password-reset-salt', max_age=max_age)
        return email
    except SignatureExpired:
        return None  # Token หมดอายุ
    except BadSignature:
        return None  # Token ไม่ถูกต้อง

# ตัวอย่างลิงก์รีเซ็ตรหัสผ่าน (เปลี่ยน URL ให้เป็นของเว็บไซต์คุณ)
def generate_reset_link(user_email, token):
    
    reset_link = f'token={token}&email={user_email}'
    return reset_link

def send_reset_email(user_email, reset_link):
    # สร้างเนื้อหาอีเมล
    message = MIMEText(f'Please copy token to reset your password: {reset_link}')
    message['Subject'] = 'Password Reset Request'
    message['From'] = 'your-email@gmail.com'
    message['To'] = user_email

    # ตั้งค่าเซิร์ฟเวอร์ SMTP (ในที่นี้ใช้ Gmail)
    smtp_server = 'smtp.gmail.com'
    smtp_port = 587
    smtp_user = 'JameabirdTAT@gmail.com'
    smtp_password = 'ersm htru rsee ebzb'  # ใช้รหัสผ่านแอปของ Google

    # ส่งอีเมล
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # เปิดการเข้ารหัส TLS
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, user_email, message.as_string())
        print('Reset email sent successfully!')
    except Exception as e:
        print(f'Failed to send email: {e}')

# ตัวอย่างการใช้งาน
#user_email = 'kitti.sir@ku.th'
#token = generate_token()
#reset_link = generate_reset_link(user_email, token)
#send_reset_email(user_email, reset_link)

app = Flask(__name__) 
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route("/register", methods=["POST"])    #register_account
@cross_origin()
def regis():
    get_next_user_id()
    data=request.get_json()
    username=data["username"]
    password=data["password"]
    email=data["email"]
    success, message = register(username, password, email)
    
    if success:
        return jsonify({"message": message}), 201
    else:
        return jsonify({"message": message}), 400

    
@app.route("/forget", methods=["POST"]) 
@cross_origin()
def reset():
    data=request.get_json()
    email = data["email"]
    user = collection.find_one({"email": email})
    if not user:
        return jsonify({"message": "No user found with this email"}), 404
    token = generate_reset_token(email)
    link=generate_reset_link(email,token)
    send_reset_email(email,link)
    return jsonify({"message": "send complete"}),200
    
    
    
    
@app.route("/forget_password", methods=["GET","POST"])
@cross_origin()
def reset_password():
    data = request.get_json()
    token_email =data["token"]
    pairs = token_email.split('&')  # ['token=...', 'email=...']
    data_dict = {}

    for pair in pairs:
     key, value = pair.split('=')
     data_dict[key] = value

    token = data_dict.get('token')
    email = data_dict.get('email')

    if not token or not email:
        return jsonify({"message": "Invalid request"}), 400
    
    try:
        # ตรวจสอบและถอดรหัส token (token มีอายุ 3600 วินาทีหรือ 1 ชั่วโมง)
        email = s.loads(token, salt='password-reset-salt', max_age=3600)
    except:
        return jsonify({"message": "Invalid or expired token"}), 400

    if request.method == "GET":
        # หากต้องการให้แสดงหน้าให้ผู้ใช้กรอกรหัสผ่านใหม่ สามารถทำได้ที่นี่
        return jsonify({"message": "Token is valid, proceed to reset password."}), 200

    # หากเป็น POST ให้ดำเนินการรีเซ็ตรหัสผ่านตามที่คุณเขียนไว้
    data = request.get_json()
    password = data.get("password")
    
    # ตรวจสอบความแข็งแกร่งของรหัสผ่าน (สามารถใช้ is_strong_password ได้)
    password_valid, password_message = is_strong_password(password)
    if not password_valid:
        return jsonify({"message": password_message}), 400

    # แฮชรหัสผ่านใหม่และบันทึกลงฐานข้อมูล
    salt = secrets.token_hex(32)
    hashed_password = ph.hash(password + salt)
    
    # อัปเดตข้อมูลในฐานข้อมูล
    collection.update_one(
        {"email": email},
        {"$set": {"hashed_password": hashed_password, "last_password_change": datetime.utcnow() ,'failed_attempts':0}}
    )
    
    username = collection.find_one({"email": email})  # ค้นหาเอกสารที่มี email ตรงกัน
    
    salt_collection.update_one(
        {"username": username["username"]},  # แก้ไขจาก username เป็น username["username"]
        {"$set": {"salt": salt}}
    )
    
    return jsonify({"message": "Password reset successful!"}), 200
  
@app.route("/")
def hello_world(): 
    return "<p>hello cyber</p>"



@app.route("/login", methods=["POST"])
@cross_origin()
def loginweb():
    global use
    data=request.get_json()
    username=data["username"]
    password=data["password"]
    success, message= login(username,password)
    if success :
        use=username
        return jsonify({"message": message}), 201
    else:
        return jsonify({"message": message}), 400
    
        
        
@app.route("/reset_pass", methods=["POST"])    
@cross_origin()
def reset_pass():
    data=request.get_json()
    global use
    oldpassword=data["oldPassword"]
    newPassword=data["newPassword"]
    user = collection.find_one({"username": use})
    salt_db = salt_collection.find_one({"username": use})
    if user:
        
        # นำ salt ที่เก็บไว้มาใช้
        salt = salt_db["salt"]
        # ตรวจสอบรหัสผ่านที่ผู้ใช้ป้อน
    
            # นำ salt มาผสมกับรหัสผ่านที่ผู้ใช้ป้อน
        if ph.verify(user["hashed_password"], oldpassword + salt):
            success, message= change_password(use,newPassword)
            if success :
             return jsonify({"message": message}), 201
            
        if  VerifyMismatchError:
            print("Incorrect password.")  
            return jsonify({"message": message}), 400
    else:
        return jsonify({"message": message}), 400            
                
                
                
    
    

@app.route('/check', methods=['GET'])
def check_password_expiry():
    global use
      # รับ username จาก query parameter
    expired, message = is_password_expired(use)
    if expired:
        return jsonify({"success": True, "message": message}), 200
    else:
        return jsonify({"success": False, "message": message}) ,400   





if __name__ == "__main__":
    app.run(host="0.0.0.0",port=5000)

# ตัวอย่างการเรียกใช้งานฟังก์ชัน login
username_input = "abcdef3"  # ชื่อผู้ใช้ที่ผู้ใช้ป้อน
password_input = "A1bcdefghijk!3"   # รหัสผ่านที่ผู้ใช้ป้อน
pass1 = "A1bcdefghijk!2"
#login(username_input, password_input)
#register(username_input,password_input)
#change_password(username_input,pass1)
