from flask import Flask, jsonify, request, session, render_template, redirect
from flask.ext.cors import CORS, cross_origin
from db import detdp
from autoupload import detdpautoupload
from datetime import datetime
import json
import os
import pymongo

# UPLOAD_FOLDER_D = 'uploads/data'
# UPLOAD_FOLDER_C = 'uploads/conf'
ALLOWED_EXTENSIONS = {'csv'}

app = Flask(__name__, static_url_path='')
app.secret_key = 'detdpdemo key'
# app.config['UPLOAD_FOLDER_D'] = UPLOAD_FOLDER_D
# app.config['UPLOAD_FOLDER_C'] = UPLOAD_FOLDER_C

CORS(app)


def allowed_file(filename):
    result = '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS
    return result


@app.route('/')
def root():
    return app.send_static_file('index.html')


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
            role = 'public'
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
    result = db.upload_data_files(doe_program, doe_record_mode, doe_read_only, data_file, conf_file, doe_name,
                                  doe_descr,
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
    # result = 'Delete data file: {}\n Delete Conf file: {}'.format(data_status, conf_status)
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
        doe_name = [str(x).strip() for x in var_doe_name.split(',')]
    if var_doe_descr == '':
        doe_descr = []
    else:
        doe_descr = [str(x).strip() for x in var_doe_descr.split(',')]
    if var_doe_comment == '':
        doe_comment = []
    else:
        doe_comment = [str(x).strip() for x in var_doe_comment.split(',')]
    if var_doe_program == '':
        program = []
    else:
        program = [str(x).strip() for x in var_doe_program.split(',')]
    if var_doe_record_mode == '':
        record_mode = []
    else:
        record_mode = [str(x).strip() for x in var_doe_record_mode.split(',')]
    if var_doe_read_only == '':
        read_only = []
    else:
        read_only = var_doe_read_only.split(',')

    result = db.get_doe_summary(doe_name, doe_descr, doe_comment, program, record_mode, read_only, s_y, s_m, s_d, e_y,
                                e_m, e_d)
    return jsonify({'status': result})


@app.route('/get$conf$summary')
def get_conf_summary():
    print 'API: /get$conf$summary, method: get_conf_summary()'
    db = detdp()
    result = db.get_conf_overview()
    return jsonify({'status': result})


@app.route('/get$program$recordmode$pair')
def get_program_recordmode_pair():
    print 'API: /get$program$recordmode$pair, method: get_program_recordmode_pair()'
    db = detdp()
    result = db.get_program_recordmode()
    return jsonify({'status': result})


@app.route('/set$program$recordmode$pair', methods=['GET', 'POST'])
def set_program_recordmode_pair():
    print 'API: /set$program$recordmode$pair, method: set_program_recordmode_pair()'
    db = detdp()
    input_data = json.loads(request.data)
    old_pair = []

    for row in input_data:
        tmp = {
            'program': str(row['program']).lower(),
            'record_mode': str(row['record_mode']).lower()
        }
        old_pair.append(tmp)
    result = db.set_program_recordmode(old_pair)
    return jsonify({'status': result})


@app.route('/get$save$system$setup', methods=['GET', 'POST'])
def set_system_setup():
    print 'API: /get$save$setup, method: set_user_setup()'
    input_data = json.loads(request.data)
    user_name = input_data['admin_name']
    std_cols = input_data['std_cols']
    db = detdp()
    if user_name == 'admin':
        result = db.set_system_cols(std_cols)
    else:
        result = 'Permission denied!'
    return jsonify({'status': result})


@app.route('/get$file$retrieve', methods=['GET', 'POST'])
def get_file_retrieve():
    print 'API: /get$file$retrieve, method: get_file_retrieve()'
    input_data = json.loads(request.data)
    user_name = input_data['user_name']
    var_flag = input_data['flag']
    var_record_mode = input_data['record_mode']
    var_program = input_data['program']
    var_read_only = input_data['read_only']
    var_doe_no = input_data['doe_no']
    var_design_no = input_data['design_no']
    var_email = input_data['email']
    var_param = input_data['params']

    print input_data

    if var_record_mode == '':
        record_mode = []
    else:
        record_mode = [str(x).strip() for x in var_record_mode.split(',')]

    if var_program == '':
        program = []
    else:
        program = [str(x).strip() for x in var_program.split(',')]

    if len(var_read_only) == 0:
        read_only = ''
    else:
        read_only = [str(x).strip() for x in var_read_only]

    if var_doe_no == '':
        doe_no = []
    else:
        doe_no = [str(x).strip() for x in var_doe_no.split(',')]

    if var_design_no == '':
        design_no = []
    else:
        design_no = [str(x).strip() for x in var_design_no.split(',')]

    if var_email == '':
        email = []
    else:
        email = [str(x).strip() for x in var_email.split(',')]

    if len(var_param) == 0:
        param = {}
    else:
        param = {}
        for p in var_param:
            for k, v in p.iteritems():
                if v == '':
                    param[str(k)] = []
                else:
                    param[str(k)] = [str(x).strip() for x in v.split(',')]

    if len(var_flag) == 0:
        flag = ['S']
    else:
        flag = var_flag

    db = detdp()
    result = db.get_file_retrieve(user_name, program, record_mode, read_only, doe_no, design_no, param, email, flag)
    print "TEST", result
    return jsonify({'status': result})


@app.route('/get$colmn$mapping$pair')
def get_colmapping_pair():
    print 'API: /get$colmn$mapping$pair, method: get_colmapping_pair()'
    db = detdp()
    result = db.get_col_mapping()
    return jsonify({'status': result})


@app.route('/set$colmn$mapping$pair', methods=['GET', 'POST'])
def set_colmapping_pair():
    print 'API: /set$colmn$mapping$pair, method: set_colmapping_pair()'
    input_data = json.loads(request.data)
    new_pair = []
    for row in input_data:
        tmp = {
            'old_cols': str(row['old_cols']).lower(),
            'new_cols': str(row['new_cols']).lower()
        }
        new_pair.append(tmp)
    db = detdp()
    result = db.set_col_mapping(new_pair)
    return jsonify({'status': result})


@app.route('/get$upload$log', methods=['GET', 'POST'])
def get_upload_log():
    print 'API: /get$upload$log, method: get_upload_log()'
    input_data = json.loads(request.data)
    s_y = input_data['s_y']
    s_m = input_data['s_m']
    s_d = input_data['s_d']
    e_y = input_data['e_y']
    e_m = input_data['e_m']
    e_d = input_data['e_d']
    db = detdp()
    result = db.get_upload_log(s_y, s_m, s_d, e_y, e_m, e_d)
    return jsonify({'status': result})


@app.route('/get$manual$upload', methods=['GET', 'POST'])
def get_manual_upload():
    print 'API: /get$manual$upload, method: get_manual_upload()'
    auto_upload = detdpautoupload()
    auto_upload.get_file('Admin_manual')
    print 'Finish manual upload,call method'
    return jsonify({'status': 'Upload finished, go to log for information.'})


@app.route('/get$link$cols$list$predix')
def get_linkcols_prefix():
    print 'API: /get$link$cols$list$predix, method: get_autoupload_conf()'
    db = detdp()
    result = db.get_autoupload_conf()
    return jsonify({'status': result})


@app.route('/set$link$cols$list$predix', methods=['GET', 'POST'])
def set_linlcols_prefix():
    print 'API: /set$link$cols$list$predix, method : set_autoupload_conf'
    input_data = json.loads(request.data)
    data_prefix = input_data['data_prefix']
    conf_prefix = input_data['conf_prefix']
    link_list = [x.lower() for x in input_data['link_list']]
    db = detdp()
    result = db.set_autoupload_conf(data_prefix, conf_prefix, link_list)
    if result:
        msg = 'SAVE DONE!'
    else:
        msg = 'SAVE FAILED'
    return jsonify({'status': msg})


@app.route('/get$exp$type')
def get_exp_type():
    print 'API: /get$exp$type, method: get_exp_type()'
    db = detdp()
    result = db.get_exp_type()
    return jsonify({'status': result})


@app.route('/set$exp$type', methods=['GET', 'POST'])
def set_exp_type():
    print 'API: /set$exp$type, method: set_exp_type()'
    input_data = json.loads(request.data)
    exp_type = [x.lower() for x in input_data]
    db = detdp()
    result = db.set_exp_type(exp_type)
    if result:
        msg = 'SAVE DONE!'
    else:
        msg = 'SAVE FAILED'
    return jsonify({'status': msg})


@app.route('/upload$work$file', methods=['GET', 'POST'])
def upload_work_file():
    print 'API: /upload$work$file, method: upload_temp()'
    if request.method == 'POST':
        db = detdp()
        file = request.files['file']
        file_id = db.upload_temp(file)
        result = {
            'file_name': file.filename,
            'file_id': str(file_id)
        }
    return jsonify({'status': result})


@app.route('/cancel$work$file$upload', methods=['GET', 'POST'])
def del_work_file():
    print 'API: /cancel$work$file$upload, method: delete_temp()'
    result = True
    db = detdp()
    input_data = json.loads(request.data)
    for row in input_data:
        print 'Delete File: ', row['file_name']
        file_id = row['file_id']
        tmp = db.delete_temp(file_id)
        result = result and tmp

    if result:
        msg = "CANCEL DONE"
    else:
        msg = "CANCAL FAILED"

    return jsonify({'status': msg})


@app.route('/confirm$work$file$upload', methods=['GET', 'POST'])
def confirm_work_file():
    print 'API: /confirm$work$file$upload, method: upload_work_file_toDB()'
    db = detdp()
    input_data = json.loads(request.data)
    exp_user = input_data['exp_user']
    program = input_data['program']
    record_mode = input_data['record_mode']
    read_only = input_data['read_only']
    exp_type = input_data['exp_type']
    project = input_data['project']
    tester = input_data['tester']
    comment = input_data['comment']
    file_list = input_data['files']

    result = db.upload_work_file_toDB(exp_user, program, record_mode, read_only, exp_type, project, tester, comment,
                                      file_list)
    if result:
        msg = 'UPLOAD DONE.'
    else:
        msg = 'UPLOAD FAILED'
    return jsonify({'status': msg})


@app.route('/get$work$file$summary', methods=['GET', 'POST'])
def get_work_file_summary():
    print 'API: /confirm$work$file$upload, method: get_work_file_overview()'
    db = detdp()
    input_data = json.loads(request.data)
    exp_user = input_data['exp_user']
    time_range = input_data['shownPeriod']
    result = db.get_work_file_overview(exp_user, time_range, '', '')

    return jsonify({'status': result})


@app.route('/search$work$file$summary', methods=['GET', 'POST'])
def search_work_file_summary():
    print 'API: /search$work$file$summary, method: get_work_file_overview'
    db = detdp()
    input_data = json.loads(request.data)
    exp_user = input_data['exp_user']
    s_y = input_data['s_y']
    s_m = input_data['s_m']
    s_d = input_data['s_d']

    e_y = input_data['e_y']
    e_m = input_data['e_m']
    e_d = input_data['e_d']
    start_time = datetime(int(s_y), int(s_m), int(s_d))
    end_time = datetime(int(e_y), int(e_m), int(e_d), 23, 59, 59)
    result = db.get_work_file_overview(exp_user, '', start_time, end_time)
    return jsonify({'status': result})

@app.route('/concat$work$file', methods = ['GET', 'POST'])
def concat_work_file_toOne():
    print 'API: /concat$work$file, method: concat_work_file'
    db = detdp()
    input_data = json.loads(request.data)
    concat_files = []
    for row in input_data:
        tmp = {}
        tmp['exp_user'] = row.get('exp_user')
        tmp['exp_no'] = row.get('exp_no')
        tmp['sub_exps'] = '*' if row.get('sub_exps') == '*' else [int(x) for x in row.get('sub_exps').split(',')]
        if tmp['sub_exps'] != '*':
            tmp['sub_exps'] = list(set(tmp['sub_exps']))
        concat_files.append(tmp)

    print concat_files
    # result = db.concat_work_file(concat_files)
    result = {'comment': 'Good', 'file_name': 'File_name'}
    return jsonify({'status': result})
@app.route('/get$sub$exp$detail', methods = ['GET', 'POST'])
def get_sub_exp_detail():
    print 'API: /get$sub$exp$detail, method: get_work_file_subfile'
    db = detdp()
    input_data = json.loads(request.data)
    exp_user = input_data['exp_user']
    exp_no = input_data['exp_no']
    result = db.get_work_file_subfile(exp_user, exp_no)
    for row in result:
        print row
    return jsonify({'status': result})

if __name__ == "__main__":
    app.run(debug=True)
