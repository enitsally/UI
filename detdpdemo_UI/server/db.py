from pymongo import MongoClient
from bson.objectid import ObjectId
import gridfs
from bson.code import Code
import operator
from fuzzywuzzy import fuzz
import unicodecsv
import StringIO
import time
import datetime


class detdp:
  def __init__(self):
    self.conn_str = "mongodb://mapserverdev:27017"
    self.client = MongoClient(self.conn_str)
    self.db = self.client['detdp']

  def get_DB(self):
    return self.db

  def get_login(self, user_name, user_password):
    user_group = self.db.user.find({'user_name': user_name, 'user_password': user_password}, {'user_group': 1})
    str_method = 'get_login(user_name = {}, user_password = {})'.format(user_name, user_password)
    print 'call method: ', str_method
    if user_group.count() == 1:
      return user_group[0]['user_group']
    elif user_group.count() == 0 is None:
      return None
    else:
      return None

  def get_record_mode(self):
    str_method = 'get_record_mode()'
    print 'call method: ', str_method
    result = self.db.data_conf.find({}).distinct('record_mode')
    return result

  def get_program(self):
    str_method = 'get_program()'
    print 'call method: ', str_method
    tmp = self.db.data_conf.find({}, {'_id': False})
    result = [t for t in tmp]
    return result

  def get_upload_overview(self):
    str_method = 'get_upload_overview()'
    print 'call method: ', str_method
    mapper = Code("""
                        function(){
                            var combo_key = { 'doe_name':this.doe_name, 'program':this.program,
                            'record_mode':this.record_mode, 'read_only': this.read_only};
                            emit(combo_key,1);
                        }
                    """)

    reducer = Code("""
                        function (key, values){
                            var total = 0;
                            for (var i = 0; i < values.length; i++){
                                total += values[i];
                            }
                            return total;
                        }
                    """)
    conf_info = self.db.conf_file.map_reduce(mapper, reducer, "myresult")
    conf_list = []
    for row in conf_info.find():
      conf_list.append(row.get('_id'))

    data_info = self.db.data_file.find({}, projection={'doe_name': True, 'doe_descr': True, 'comment': True,
                                                       'upload_date': True, 'upload_user': True, 'file_size': True,
                                                       '_id': False})
    data_list = []
    for row in data_info:
      if row.get('upload_date') is not None:
        row['upload_date'] = str(row['upload_date'])
      data_list.append(row)

    sorting_key = operator.itemgetter("doe_name")
    for i, j in zip(sorted(conf_list, key=sorting_key), sorted(data_list, key=sorting_key)):
      i.update(j)
    return conf_list

  def get_column_chk_conf(self, conf_file):
    str_method = 'get_column_chk_conf(conf_file = {})'.format(conf_file)
    print 'call method: ', str_method
    temp_file_id = self.upload_temp(conf_file)
    sys_cols = self.db.system_conf.find_one({})
    sys_cols_conf = sys_cols.get('conf_cols')

    conf_file.seek(0)
    reader = unicodecsv.reader(conf_file)
    conf_file_cols_list = reader.next()
    conf_file_cols_list = [x.lower().encode('ascii', 'ignore') for x in conf_file_cols_list]

    new_conf_cols_list = []
    dup_conf_cols_list = []
    dup_conf_cols_set = set()

    for t in conf_file_cols_list:
      if t not in sys_cols_conf:
        new_conf_cols_list.append(t)
      if t not in dup_conf_cols_set:
        dup_conf_cols_set.add(t)
      else:
        dup_conf_cols_list.append(t)

    result = {'new_conf': new_conf_cols_list,
              'dup_conf': dup_conf_cols_list}

    lst = []
    for i in range(len(conf_file_cols_list) - 1):
      temp = conf_file_cols_list[i]
      for j in range(i + 1, len(conf_file_cols_list)):
        comp = conf_file_cols_list[j]
        rate = fuzz.ratio(temp, comp)
        if rate > 80:
          t = [temp, comp, rate]
          lst.append(t)
    result['conf_cols_ratio'] = lst

    lst = []
    for t in new_conf_cols_list:
      for tt in conf_file_cols_list:
        rate = fuzz.ratio(t, tt)
        if rate > 80:
          r = [t, tt, rate]
          lst.append(t)
    result['new_conf_ratio'] = lst
    result['temp_file_id'] = str(temp_file_id)
    return result

  def get_column_chk_data(self, data_file):
    str_method = 'get_column_chk_data(data_file = {})'.format(data_file)
    print 'call method: ', str_method

    temp_file_id = self.upload_temp(data_file)
    sys_cols = self.db.system_conf.find_one({})
    sys_cols_full = sys_cols.get('full_cols')

    data_file.seek(0)
    reader = unicodecsv.reader(data_file)
    data_file_cols_list = reader.next()
    data_file_cols_list = [x.lower().encode('ascii', 'ignore') for x in data_file_cols_list]

    new_data_cols_list = []
    dup_data_cols_list = []
    dup_data_cols_set = set()

    for t in data_file_cols_list:
      if t not in sys_cols_full:
        new_data_cols_list.append(t)
    if t not in dup_data_cols_set:
      dup_data_cols_set.add(t)
    else:
      dup_data_cols_list.append(t)

    result = {'new_data': new_data_cols_list,
              'dup_data': dup_data_cols_list}

    lst = []
    for i in range(len(data_file_cols_list) - 1):
      temp = data_file_cols_list[i]
      for j in range(i + 1, len(data_file_cols_list)):
        comp = data_file_cols_list[j]
        rate = fuzz.ratio(temp, comp)
        if rate > 80:
          t = [temp, comp, rate]
          lst.append(t)
    result['data_cols_ratio'] = lst

    lst = []
    for t in new_data_cols_list:
      for tt in data_file_cols_list:
        rate = fuzz.ratio(t, tt)
        if rate > 80:
          r = [t, tt, rate]
          lst.append(r)
    result['new_data_ratio'] = lst
    result['temp_file_id'] = str(temp_file_id)
    return result

  def get_exist_chk(self, program, record_mode, read_only, doe_name):
    str_method = 'get_exist_chk(program = {}, record_mode = {}, read_only = {}, doe_name = {})'.format(program,
                                                                                                       record_mode,
                                                                                                       read_only,
                                                                                                       doe_name)
    print 'call method: ', str_method

    status = 'PASS'
    comment = ''
    # ------ Check if the DOE name is already stored in database, if exist, delete, for both data file and conf file
    exist_data_file = self.db.data_file.find(
      {'doe_name': doe_name, 'program': program, 'record_mode': record_mode, 'read_only': read_only},
      projection={'data_file_id': True, '_id': True})
    exist_conf_file = self.db.conf_file.find(
      {'doe_name': doe_name, 'program': program, 'record_mode': record_mode, 'read_only': read_only})
    if (exist_data_file.count() > 0) or (exist_conf_file.count() > 0):
      status = 'EXIST'
      if exist_conf_file.count() > 0:
        one_record = exist_conf_file[0]
        comment = "File exists! The existing file have the Program name as : {}, Record_mode as : {}, Read_only as : {}".format(
          one_record.get('program'), one_record.get('record_mode'), one_record.get('read_only'))
      elif exist_data_file.count() > 0:
        one_record = exist_data_file[0]
        comment = "File exists! The existing file have the Program name as : {}, Record_mode as : {}, Read_only as : {}".format(
          one_record.get('program'), one_record.get('record_mode'), one_record.get('read_only'))
      else:
        comment = "File exist! Data File exists."
    return {'status': status, 'comment': comment}

  def upload_data_files(self, program, record_mode, read_only, data_file_input, conf_file_input, doe_name, doe_descr,
                        doe_comment, user_name, flag):
    str_method = 'get_exist_chk(program = {}, record_mode = {}, read_only = {}, data_file_input = {}, conf_file_input = {}, doe_name = {}, doe_descr = {}, comment = {}, user_name = {}, flag = {} )'.format(
      program, record_mode, read_only, data_file_input, conf_file_input, doe_name, doe_descr,
      doe_comment, user_name, flag)
    print 'call method: ', str_method

    fs = gridfs.GridFS(self.db)
    data_id = ObjectId(data_file_input)
    conf_id = ObjectId(conf_file_input)
    data_file = StringIO.StringIO(fs.get(data_id).read())
    conf_file = StringIO.StringIO(fs.get(conf_id).read())
    status = ''
    comment = ''
    # ------ Check if the DOE name is already stored in database, if exist, delete, for both data file and conf file
    exist_data_file = self.db.data_file.find(
      {'doe_name': doe_name, 'program': program, 'record_mode': record_mode, 'read_only': read_only},
      projection={'data_file_id': True, '_id': True})
    exist_conf_file = self.db.conf_file.find(
      {'doe_name': doe_name, 'program': program, 'record_mode': record_mode, 'read_only': read_only})
    if (exist_data_file.count() > 0) or (exist_conf_file.count() > 0):
      if flag == 2:  # user choose to update the existing data
        # 1 for data file in 'data_file' collection, if find, delete
        count = 0
        count_dfile = 0
        if exist_data_file.count() > 0:
          for f in exist_data_file:
            fs.delete(f['data_file_id'])
            result = self.db.data_file.delete_many({'data_file_id': f['data_file_id']})
            count += 1
            count_dfile += result.deleted_count
          comment += 'Delete data file record from detdp database gridfs collection, # of deleted records: {} \n'.format(
            count)
          comment += 'Delete data file index record from data_file collection, # of deleted records: {} \n'.format(
            count_dfile)
        # 2 for conf file in 'conf_file' collection, if find, delete
        if exist_conf_file.count() > 0:
          result = self.db.conf_file.delete_many(
            {'doe_name': doe_name, 'program': program, 'record_mode': record_mode, 'read_only': read_only})
          comment += 'Delete conf file record from conf_file collection, # of deleted records: {} \n'.format(
            result.deleted_count)

    # -------- Update the full columns list, in the 'system_conf' collection
    data_file.seek(0)
    reader = unicodecsv.reader(data_file)
    new_full_cols_list = reader.next()
    new_full_cols_list = [x.lower().encode('ascii', 'ignore') for x in new_full_cols_list]

    old_full_cols = self.db.system_conf.find_one({})
    if old_full_cols is None:
      temp = {'full_cols': new_full_cols_list}
      self.db.system_conf.insert_one(temp)
    else:
      old_full_cols_list = old_full_cols.get('full_cols')
      if old_full_cols_list is None:
        update_full_cols_list = old_full_cols
        update_full_cols_list['full_cols'] = new_full_cols_list
        self.db.system_conf.delete_one({})
        self.db.system_conf.insert_one(update_full_cols_list)
      else:
        update_full_cols_list = set(old_full_cols_list).union(set(new_full_cols_list))
        result = self.db.system_conf.replace_one({'full_cols': old_full_cols_list},
                                                 {'full_cols': list(update_full_cols_list)}, True)

    # ----------- Update the conf columns list, in the 'system_conf' collection
    conf_file.seek(0)
    reader = unicodecsv.reader(conf_file)
    new_conf_cols_list = reader.next()
    new_conf_cols_list = [x.lower().encode('ascii', 'ignore') for x in new_conf_cols_list]
    old_conf_cols = self.db.system_conf.find_one({})

    if old_conf_cols is None:
      temp = {'conf_cols': new_conf_cols_list}
      self.db.system_conf.insert_one(temp)
    else:
      old_conf_cols_list = old_conf_cols.get('conf_cols')
      if old_conf_cols_list is None:
        update_conf_cols_list = old_conf_cols
        update_conf_cols_list['conf_cols'] = new_conf_cols_list
        self.db.system_conf.delete_one({})
        self.db.system_conf.insert_one(update_conf_cols_list)
      else:
        update_conf_cols_list = set(old_conf_cols_list).union(set(new_conf_cols_list))
        result = self.db.system_conf.replace_one({'conf_cols': old_conf_cols_list},
                                                 {'conf_cols': list(update_conf_cols_list)}, True)

    # ------- Insert new data file into gridfs and an index file into 'data_file' collection
    data_file_id = fs.put(data_file)
    temp = fs.find_one(filter=data_file_id)
    data_dict = {'doe_name': doe_name,
                 'doe_descr': doe_descr,
                 'comment': doe_comment,
                 'program': program,
                 'record_mode': record_mode,
                 'read_only': read_only,
                 'upload_user': user_name,
                 'upload_date': time.strftime('%m/%d/%Y,%H:%M:%S'),
                 'file_size': str(float("{0:.2f}".format(temp.length / 1024.00 / 1024.00))) + 'MB',
                 'data_file_id': data_file_id}
    self.db.data_file.insert_one(data_dict)
    print 'File Size:', str(float("{0:.2f}".format(temp.length / 1024.00 / 1024.00))) + 'MB'

    # -------- Insert conf file into the 'conf_file' collection
    conf_file.seek(0)
    full_conf = self.db.system_conf.find_one({})
    if full_conf is not None:
      full_conf_list = full_conf.get('conf_cols')
    else:
      full_conf_list = []
    # get full conf cols into dictionary and set the values to '' if the record don't have the key
    reader = unicodecsv.DictReader(conf_file, fieldnames=full_conf_list, restval='')
    for row in reader:
      row['doe_name'] = doe_name
      row['program'] = program
      row['record_mode'] = record_mode
      row['read_only'] = read_only
      self.db.conf_file.insert_one(row)

    status = 'INSERT'
    comment += 'Upload data file and conf. file succeeded.'
    self.delete_temp(data_file_input)
    self.delete_temp(conf_file_input)
    return {'status': status, 'comment': comment}

  def upload_temp(self, tempFile):
    str_method = 'upload_temp( tempFile = {})'.format(tempFile)
    print 'call method: ', str_method

    fs = gridfs.GridFS(self.db)
    file_id = fs.put(tempFile)
    return file_id

  def delete_temp(self, tempFile):
    str_method = 'upload_temp( tempFile = {})'.format(tempFile)
    print 'call method: ', str_method
    fs = gridfs.GridFS(self.db)
    file_id = ObjectId(tempFile)
    fs.delete(file_id)
    if fs.exists(tempFile):
      return False
    else:
      return True

  def get_system_cols(self):
    str_method = 'get_full_cols( )'
    print 'call method: ', str_method
    tmp = self.db.system_conf.find_one({})
    if tmp is not None:
      result = {'standard_cols': tmp.get('standard_cols'),
                'full_cols': tmp.get('full_cols')
                }
    else:
      result = {'standard_cols': [],
                'full_cols': []
                }
    return result

  def get_user_cols(self, user_name):
    str_method = 'get_user_cols( user_name = {})'.format(user_name)
    print 'call method: ', str_method

    result = {'standard_cols': [],
              'customized_cols': []}
    r = self.db.user.find({'user_name': user_name})
    sys = self.get_system_cols()
    if r.count() != 1:
      print "System error, no user or multiple user"
    else:
      tmp = r[0]
      if tmp.get('standard_cols') == None:
        std_comment = "User have no standard setup, use system setup"
      else:
        std_comment = 'Get user standard setup'
        result['standard_cols'] = tmp.get('standard_cols')
      if tmp.get('customized_cols') == None:
        cus_comment = "User have no customized setup, use system setup"
      else:
        cus_comment = 'Get user customized setup'
        result['customized_cols'] = tmp.get('customized_cols')

    result['cus_comment'] = cus_comment
    result['std_comment'] = std_comment
    return result

  def set_user_cols(self, user_name, std_cols, cus_cols):
    str_method = 'set_user_cols( user_name = {}, std_cols = {}, cus_cols = {})'.format(user_name, std_cols, cus_cols)
    print 'call method: ', str_method

    user_column = self.db.user.find_one({'user_name': user_name})
    old_std_cols_list = user_column.get('standard_cols')
    old_cus_cols_list = user_column.get('customized_cols')
    if old_std_cols_list is None:
      std_comment = "No user standard setup, add new setup"
    else:
      std_comment = "User standard setup replaced"
    if old_cus_cols_list is None:
      cus_comment = "No user customized setup, add new setup"
    else:
      cus_comment = "User customized setup replaced"
    self.db.user.find_one_and_update({'user_name': user_name},
                                     {'$set': {'customized_cols': cus_cols, 'standard_cols': std_cols}})

    return {'std_comment': std_comment, 'cus_comment': cus_comment}

  def get_doe_summary(self, doe_name, doe_descr, doe_comment, program, record_mode, read_only, s_y, s_m, s_d, e_y, e_m,
                      e_d):
    str_method = 'get_doe_summary(doe_name = {}, doe_descr = {}, doe_comment = {}, program = {}, record_mode = {}, read_only = {}, s_y = {}, s_m = {}, s_d = {}, e_y = {}, e_m = {}, e_d= {} )'.format(
      doe_name, doe_descr, doe_comment, program, record_mode, read_only, s_y, s_m, s_d, e_y, e_m,
      e_d)
    print 'call method: ', str_method
    query_dict = {}
    if len(doe_name) > 0:
      if query_dict.get('doe_name') is None:
        query_dict['doe_name'] = {}
      query_dict['doe_name']['$in'] = doe_name
    if len(doe_descr) > 0:
      if query_dict.get('doe_descr') is None:
        query_dict['doe_descr'] = {}
      query_dict['doe_descr']['$in'] = doe_descr
    if len(doe_comment) > 0:
      if query_dict.get('comment') is None:
        query_dict['comment'] = {}
      query_dict['comment']['$in'] = doe_comment
    if len(program) > 0:
      if query_dict.get('program') is None:
        query_dict['program'] = {}
      query_dict['program']['$in'] = program
    if len(record_mode) > 0:
      if query_dict.get('record_mode') is None:
        query_dict['record_mode'] = {}
      query_dict['record_mode']['$in'] = record_mode
    if len(read_only) > 0:
      if query_dict.get('read_only') is None:
        query_dict['read_only'] = {}
      query_dict['read_only']['$in'] = read_only
    if s_y != '' and s_m != '' and s_d != '':
      if query_dict.get('upload_date') is None:
        query_dict['upload_date'] = {}
      s_t = datetime.datetime(s_y, s_m, s_d, 0, 0, 1).strftime('%m/%d/%Y,%H:%M:%S')
      query_dict['upload_date']['$gt'] = s_t
    if e_y != '' and e_m != '' and e_d != '':
      if query_dict.get('upload_date') is None:
        query_dict['upload_date'] = {}
      e_t = datetime.datetime(e_y, e_m, e_d, 23, 59, 59).strftime('%m/%d/%Y,%H:%M:%S')
      query_dict['upload_date']['$lt'] = e_t
    print query_dict
    return list(self.db.data_file.find(query_dict, {'_id': False, 'data_file_id': False}))

  def get_conf_overview(self):
    tmp = self.db.conf_file.find({}, projection={'_id': False})
    conf_tmp = self.db.system_conf.find_one({})
    if tmp.count() > 0:
      result = list(tmp)
    else:
      result = []

    if conf_tmp is not None:
      conf_col = conf_tmp.get('conf_cols')
      if len(conf_col) > 0:
        conf_col.append('doe_name')
        conf_col.append('program')
        conf_col.append('record_mode')
        conf_col.append('read_only')
    else:
      conf_col = []
    return {'conf_col': conf_col, 'conf_content': result}

  def get_program_recordmode(self):
    tmp = self.db.data_conf.find({})
    result = []
    for t in tmp:
      row = {
        'program': t['program'],
        'record_mode': t['record_mode'],
        'row_id': str(t['_id'])
      }
      result.append(row)
    return result

  def set_program_recordmode(self, input):
    result = self.db.data_conf.delete_many({})
    del_no = result.deleted_count
    if len(input) == 0:
      add_no = 0;
    else:
      result = self.db.data_conf.insert_many([x for x in input])
      add_no = len(result.inserted_ids)

    return {'del_no': del_no, 'add_no':add_no}

  def set_system_cols(self, std_cols):
    str_method = 'set_system_cols( std_cols = {})'.format(std_cols)
    print 'call method: ', str_method

    sys_column = self.db.system_conf.find_one({})
    old_std_cols_list = sys_column.get('standard_cols')
    if old_std_cols_list is None:
      std_comment = "No system standard setup"
    else:
      std_comment = "System standard setup replaced"
    self.db.system_conf.find_one_and_update({},
                                     {'$set': {'standard_cols': std_cols}})

    return std_comment

# if __name__ == '__main__':
#   db = detdp()
#   result = db.get_program_recordmode_pair()
#   for row in result:
#     print row
#
#   newResult = db.set_program_recordmode_pair(result)
#   print newResult
