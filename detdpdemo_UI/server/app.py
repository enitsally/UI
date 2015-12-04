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


@app.route('/login', methods=['GET', 'POST'])
def login():
  print 'API: /login, method: login()'
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
    user = {'id': var_username, 'role': role}
  return jsonify({'status': status, 'id': id, 'user': user})


@app.route('/logout')
def logout():
  print 'API: /logout, method: logout()'
  session.pop('logged_in', None)
  status = "You are logged out."
  return jsonify({'status': status})


@cross_origin()
@app.route('/get$record$mode')
def get_record_mode():
  print 'API: /get$record$mode, method: get_record_mode()'
  db = detdp()
  status = db.get_record_mode()
  return jsonify({'status': status})


@cross_origin()
@app.route('/get$program')
def get_program():
  print 'API: /get$program, method: get_program()'
  db = detdp()
  status = db.get_program()
  return jsonify({'status': status})


@app.route('/get$upload$overview')
def get_upload_overview():
  print 'API: /get$upload$overview, method: get_upload_overview()'
  db = detdp()
  status = db.get_upload_overview()
  return jsonify({'status': status})


@app.route('/get$exist$chk', methods=['GET', 'POST'])
def get_exist_chk():
  print 'API: /get$exist$chk, method: get_exist_chk()'
  db = detdp()
  input_data = json.loads(request.data)
  doe_name = input_data['doe_name']
  program = input_data['doe_program']
  record_mode = input_data['doe_record_mode']
  read_only = input_data['doe_read_only']
  result = db.get_exist_chk(program, record_mode, read_only, doe_name)
  return jsonify({'status': result})


@app.route('/upload$d', methods=['GET', 'POST'])
def get_chk_data():
  print 'API: /upload$d, method: get_chk_data()'
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
  print 'API: /upload$c, method: get_chk_conf()'
  if request.method == 'POST':
    db = detdp()
    file = request.files['conf']
    result = db.get_column_chk_conf(file)
    return jsonify({'status': result})


@app.route('/get$upload', methods=['GET', 'POST'])
def get_upload():
  print 'API: /get$upload, method: get_upload()'
  db = detdp()
  var_input = json.loads(request.data)
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
  result = db.upload_data_files(doe_program, doe_record_mode, doe_read_only, data_file, conf_file, doe_name, doe_descr,
                                doe_comment, upload_user, flag)
  print result
  return jsonify({'status': result})


@app.route('/get$del$temp', methods=['GET', 'POST'])
def get_delete_temp():
  print 'API: /get$del$temp, method: get_delete_temp()'
  db = detdp()
  var_input = json.loads(request.data)
  data_file = var_input['data_file']
  conf_file = var_input['conf_file']
  data_status = db.delete_temp(data_file)
  conf_status = db.delete_temp(conf_file)
  result = {'data_status': data_status, 'conf_status': conf_status}
  return jsonify({'status': result})


@app.route('/get$system$setup', methods=['GET', 'POST'])
def get_system_setup():
  print 'API: /get$system$setup, method: get_system_setup()'
  db = detdp()
  result = db.get_system_cols()
  return jsonify({'status': result})


@app.route('/get$user$setup', methods=['GET', 'POST'])
def get_user_setup():
  print 'API: /get$user$setup, method: get_user_setup()'
  input_data = json.loads(request.data)
  user_name = input_data['user_name']
  db = detdp()
  result = db.get_user_cols(user_name)
  return jsonify({'status': result})

@app.route('/get$save$setup', methods=['GET', 'POST'])
def set_user_setup():
  print 'API: /get$save$setup, method: set_user_setup()'
  input_data = json.loads(request.data)
  user_name = input_data['user_name']
  std_cols = input_data['std_cols']
  cus_cols = input_data['cus_cols']
  db = detdp()
  result = db.set_user_cols(user_name, std_cols, cus_cols)
  return jsonify({'status': result})

@app.route('/get$search$summary', methods=['GET', 'POST'])
def get_search_summary():
  print 'API: /get$search$summary, method: get_search_summary()'
  db = detdp()
  input_data = json.loads(request.data)
  var_doe_name = input_data['doe_name']
  var_doe_descr = input_data['doe_descr']
  var_doe_comment = input_data['doe_comment']
  var_doe_program = input_data['doe_program']
  var_doe_record_mode = input_data['doe_record_mode']
  var_doe_read_only = input_data['doe_read_only']
  s_y = input_data['s_y']
  s_m = input_data['s_m']
  s_d = input_data['s_d']
  e_y = input_data['e_y']
  e_m = input_data['e_m']
  e_d = input_data['e_d']
  print s_y, s_m, s_d, e_y, e_m, e_d
  if var_doe_name == '':
    doe_name = []
  else:
    doe_name = var_doe_name.split(',')
  if var_doe_descr == '':
    doe_descr = []
  else:
    doe_descr = var_doe_descr.split(',')
  if var_doe_comment == '':
    doe_comment = []
  else:
    doe_comment = var_doe_comment.split(',')
  if var_doe_program == '':
    program = []
  else:
    program = var_doe_program.split(',')
  if var_doe_record_mode == '':
    record_mode = []
  else:
    record_mode = var_doe_record_mode.split(',')
  if var_doe_read_only == '':
    read_only = []
  else:
    read_only = var_doe_read_only.split(',')

  result = db.get_doe_summary(doe_name,doe_descr,doe_comment,program, record_mode, read_only, s_y, s_m, s_d, e_y, e_m, e_d)
  return jsonify({'status': result})

@app.route('/get$conf$summary',)
def get_conf_summary():
  print 'API: /get$conf$summary, method: get_conf_summary()'
  db = detdp()
  result = db.get_conf_overview()
  return jsonify({'status': result})

if __name__ == "__main__":
  app.run(debug=True)
