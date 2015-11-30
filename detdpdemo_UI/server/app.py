from flask import Flask, jsonify, request, session, render_template, redirect
from flask.ext.cors import CORS, cross_origin
from db import detdp
import json
import os
import pymongo

UPLOAD_FOLDER_D = 'uploads/data'
UPLOAD_FOLDER_C = 'uploads/conf'
ALLOWED_EXTENSIONS = {'csv'}

app = Flask(__name__)
app.secret_key = 'detdpdemo key'
app.config['UPLOAD_FOLDER_D'] = UPLOAD_FOLDER_D
app.config['UPLOAD_FOLDER_C'] = UPLOAD_FOLDER_C

CORS(app)


def allowed_file(filename):
  result = '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS
  return result


@app.route("/hello")
def hello():
  return 'hello'


@app.route('/login', methods=['GET', 'POST'])
def login():
  input_data = json.loads(request.data)

  var_username = input_data['username']
  var_password = input_data['password']
  db = detdp()
  var_user_group = db.get_login(var_username, var_password)
  if var_user_group is None:
    status = None
    id = ''
    user = {}
  else:
    session['logged_in'] = True
    status = var_user_group
    id = var_username
    if var_user_group == 'A':
      role = 'admin'
    elif var_user_group == 'U':
      role = 'uploader'
    elif var_user_group == 'R':
      role = 'retriever'
    else:
      role = ''
    user = {'id': var_username, 'role':role}
  return jsonify({'status': status, 'id':id, 'user':user})


@app.route('/logout')
def logout():
  session.pop('logged_in', None)
  status = "You are logged out."
  return jsonify({'status': status})


@cross_origin()
@app.route('/get$record$mode')
def get_record_mode():
  db = detdp()
  status = db.get_record_mode()
  return jsonify({'status': status})


@cross_origin()
@app.route('/get$program')
def get_program():
  db = detdp()
  status = db.get_program()
  return jsonify({'status': status})


@app.route('/get$upload$overview')
def get_upload_overview():
  db = detdp()
  status = db.get_upload_overview()
  return jsonify({'status': status})


@app.route('/upload$d', methods=['GET', 'POST'])
def get_chk_data():
  # input_data = json.loads(request.data)
  # var_doe_name = input_data['doe_name']
  # var_doe_descr = input_data['doe_descr']
  # var_doe_comment = input_data['doe_comment']
  # var_doe_program = input_data['doe_program']
  # var_doe_record_mode = input_data['doe_record_mode']
  # var_doe_read_only = input_data['doe_read_only']

  if request.method == 'POST':
    db = detdp()
    file = request.files['data']
    # file_name = file.filename
    # if file and allowed_file(file_name):
    #   file.save(os.path.join(app.config['UPLOAD_FOLDER_D'], file_name))
    result = db.get_column_chk_data(file)
    return jsonify({'status': result})


@app.route('/upload$c', methods=['GET', 'POST'])
def get_chk_conf():
  # input_data = json.loads(request.data)
  # var_doe_name = input_data['doe_name']
  # var_doe_descr = input_data['doe_descr']
  # var_doe_comment = input_data['doe_comment']
  # var_doe_program = input_data['doe_program']
  # var_doe_record_mode = input_data['doe_record_mode']
  # var_doe_read_only = input_data['doe_read_only']

  if request.method == 'POST':
    db = detdp()
    file = request.files['conf']
    # file_name = file.filename
    # if file and allowed_file(file_name):
    #   file.save(os.path.join(app.config['UPLOAD_FOLDER_C'], file_name))
    result = db.get_column_chk_conf(file)
    return jsonify({'status': result})

@app.route('/get$upload', methods=['GET', 'POST'])
def get_upload():
  db = detdp()
  var_input = json.loads(request.data)
  print var_input
  doe_name = var_input['doe_name']
  doe_descr = var_input['doe_descr']
  doe_comment = var_input['doe_comment']
  doe_program = var_input['doe_program']
  doe_record_mode = var_input['doe_record_mode']
  doe_read_only = var_input['doe_read_only']
  upload_user = var_input['upload_user']
  data_file = var_input['data_file']
  conf_file = var_input['conf_file']
  flag = var_input['flag']

  result = db.upload_data_files(doe_program,doe_record_mode,doe_read_only,data_file,conf_file,doe_name,doe_descr,doe_comment,flag)
  print result
  return jsonify({'status': result})


if __name__ == "__main__":
  app.run(debug=True)
