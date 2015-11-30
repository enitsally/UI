from pymongo import MongoClient
import gridfs
from bson.code import Code
import operator
from fuzzywuzzy import fuzz
import unicodecsv
from hurry.filesize import size

class detdp:
    def __init__(self):
        self.conn_str = "mongodb://mapserverdev:27017"
        self.client = MongoClient(self.conn_str)
        self.db = self.client['detdp']
    def get_DB(self):
        return self.db

    def get_login(self, user_name, user_password):
        user_group = self.db.user.find({'user_name': user_name, 'user_password': user_password}, {'user_group': 1})
        if user_group.count() == 1:
            return user_group[0]['user_group']
        elif user_group.count() == 0 is None:
            return None
        else:
            return None

    def get_record_mode(self):
        result = self.db.data_conf.find({}).distinct('record_mode')
        return result

    def get_program(self):
        tmp = self.db.data_conf.find({}, {'_id': False})
        result = [t for t in tmp]
        return result
    def get_upload_overview(self):
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
      result['temp_file_id'] =str(temp_file_id)
      return result


    def get_column_chk_data(self, data_file):
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
      result['temp_file_id'] =str(temp_file_id)
      return result

    def upload_data_files(self, program, record_mode, read_only, data_file, conf_file, doe_name, doe_descr, comment, flag):
      fs = gridfs.GridFS(self.db)
      status = ''
      comment = ''
      # ------ Check if the DOE name is already stored in database, if exist, delete, for both data file and conf file
      exist_data_file = self.db.data_file.find_one({'doe_name': doe_name},
                                               projection={'data_file_id': True, '_id': True})
      exist_conf_file = self.db.conf_file.find_one({'doe_name': doe_name})
      if (exist_data_file != None) or (exist_conf_file != None):
        status = 'EXIST'

        comment = "File exists! The existing file have the Program name as : {}, Record_mode as : {}, Read_only as : {}".format(
          exist_conf_file.get('program'), exist_conf_file.get('record_mode'), exist_conf_file.get('read_only'))
        if flag == 2:  # user choose to update the existing data
          # 1 for data file in 'data_file' collection, if find, delete
          count = 0
          if exist_data_file.count() > 0:
            for f in exist_data_file:
              fs.delete(f['data_file_id'])
              count += 1
            comment += '<br>Delete data file record from detdp database gridfs collection, # of deleted records:', count
            result = self.db.data_file.delete_many({'data_file_id': f['data_file_id']})
            comment += '<br>Delete data file index record from data_file collection, # of deleted records:', result.deleted_count
          # 2 for conf file in 'conf_file' collection, if find, delete
          if exist_conf_file.count() > 0:
            result = self.db.conf_file.delete_many({'doe_name': doe_name})
            comment += '<br>Delete conf file record from conf_file collection, # of deleted records:', result.deleted_count
        else:
          return {'status':status, 'comment':comment}
      # ------- Insert new data file into gridfs and an index file into 'data_file' collection
      data_file_id = fs.put(data_file)
      temp = fs.find_one(filter=data_file_id)
      data_dict = {'doe_name': doe_name,
                   'doe_descr': doe_descr,
                   'comment': comment,
                   'upload_user': self.user_name,
                   'upload_date': temp.upload_date,  # time.strftime('%m/%d/%Y,%H:%M:%S')
                   'file_size': size(temp.length),
                   'data_file_id': data_file_id}
      self.db.data_file.insert_one(data_dict)

      # -------- Insert conf file into the 'conf_file' collection
      conf_file.seek(0)
      reader = unicodecsv.reader(conf_file)
      conf_file_cols_list = reader.next()
      conf_file_cols_list = [x.lower().encode('ascii', 'ignore') for x in conf_file_cols_list]
      reader = unicodecsv.DictReader(conf_file, fieldnames=conf_file_cols_list)
      for row in reader:
        row['doe_name'] = doe_name
        row['program'] = program
        row['record_mode'] = record_mode
        row['read_only'] = read_only
        self.db.conf_file.insert_one(row)

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


      status += 'INSERT'
      comment += '<br> Upload data file and conf. file succeeded.'
      return {'status':status, 'comment':comment}

    def upload_temp(self, tempFile):
      fs = gridfs.GridFS(self.db)
      file_id = fs.put(tempFile)
      return file_id

    def delete_temp(self,temp_file_id):
      fs = gridfs.GridFS(self.db)
      fs.delete(temp_file_id)
      if fs.exists(temp_file_id):
        return False
      else:
        return True

