from pymongo import MongoClient
import gridfs
from os import listdir
import time
import datetime
import unicodecsv


class detdpautoupload:
  def __init__(self):
    self.conn_str = "mongodb://mapserverdev:27017"
    self.client = MongoClient(self.conn_str)
    self.db = self.client['detdp']

  def get_DB(self):
    return self.db

  def get_file(self, user_name):
    path = 'input/'
    suffix = '.csv'
    sys_mgs = ''
    fs = gridfs.GridFS(self.db)
    filenames = listdir(path)
    system_conf = self.db.system_conf.find_one({})
    if system_conf is not None:
      data_prefix = system_conf.get('data_prefix')
      conf_prefix = system_conf.get('conf_prefix')

      full_list = [] if system_conf.get('full_cols') is None else [x for x in system_conf.get('full_cols')]
      conf_list = [] if system_conf.get('conf_cols') is None else [x for x in system_conf.get('conf_cols')]
      std_col = [] if system_conf.get('standard_cols') is None else [x for x in system_conf.get('standard_cols')]
      link_list = [] if system_conf.get('link_list') is None else [str(x) for x in system_conf.get('link_list')]
      if len(std_col) == 0:
        sys_mgs += '''No std cols exist in database, need administration setup. '''
        print 'System Message: {}'.format(sys_mgs)
        return

      if len(link_list) == 0:
        sys_mgs += '''No link cols exist in database, need administration setup. '''
        print 'System Message: {}'.format(sys_mgs)
        return

    mapping = self.db.column_mapping.find({}, {'_id': False})
    mapping_head = {}
    for m in mapping:
      v = m.get('new_cols')
      k = m.get('old_cols')
      if k is not None and v is not None:
        mapping_head[k] = v

    if data_prefix is not None and conf_prefix is not None:
      dfileList = [file for file in filenames if file.endswith(suffix) and file.startswith(data_prefix)]
      cfileList = [file for file in filenames if file.endswith(suffix) and file.startswith(conf_prefix)]
    else:
      sys_mgs += '''No system prefix info, need administration setup. '''
      print 'System Message: {}'.format(sys_mgs)
      return
    log_dict = {}

    for data_name in dfileList:
      comment = ''
      sys_mgs = ''
      key = data_name.replace(suffix, '')
      timestamp = time.strftime('%m/%d/%Y,%H:%M:%S')
      log_dict[key] = {}
      log_dict[key]['data_file'] = data_name
      log_dict[key]['ready_upload'] = 'Y'
      existlog = self.db.auto_upload_log.find_one({'key': key})
      if existlog is not None:
        log_dict[key]['number_of_check'] = existlog.get('log').get('number_of_check') + 1
        log_dict[key]['checkIn_date'] = existlog.get('log').get('checkIn_date')
      else:
        log_dict[key]['number_of_check'] = 1
        log_dict[key]['checkIn_date'] = timestamp
      conf_name = data_name.replace(data_prefix, conf_prefix)
      if conf_name in cfileList:
        log_dict[key]['conf_file'] = conf_name
      else:
        log_dict[key]['conf_file'] = None
        comment += '''No matched configuration file. '''
        log_dict[key]['ready_upload'] = 'N'
      features = key.split('_')
      if len(features) != 5:
        comment += '''No matched format for file name. '''
        log_dict[key]['program'] = None
        log_dict[key]['read_only'] = None
        log_dict[key]['ready_upload'] = 'N'

      else:
        program = features[1].lower()
        recordmode = features[2].lower()
        readonly = features[3].lower()
        doename = features[4]

        chk_program = self.db.data_conf.find_one({'program': program, 'record_mode': recordmode})
        if chk_program is not None:
          log_dict[key]['program'] = 'Match'
        else:
          log_dict[key]['program'] = None
          comment += '''No matched program and record mode. '''
          log_dict[key]['ready_upload'] = 'N'

        if readonly in ('y', 'n'):
          log_dict[key]['read_only'] = 'Match'
        else:
          log_dict[key]['read_only'] = None
          comment += '''No matched format for read only/full device. '''
          log_dict[key]['ready_upload'] = 'N'

      if log_dict[key]['ready_upload'] == 'Y':
        # ------Open files--------------------------------------------------------
        with open(path + data_name, 'rb') as data_file:
          with open(path + conf_name, 'rb') as conf_file:
            data_file.seek(0)
            reader = unicodecsv.reader(data_file)
            data_head = reader.next()
            data_head = [x.lower().encode('ascii', 'ignore') for x in data_head]
            conf_file.seek(0)
            reader = unicodecsv.reader(conf_file)
            conf_head = reader.next()
            conf_head = [x.lower().encode('ascii', 'ignore') for x in conf_head]
            # ---------Opened files closed---------------------------------------------
            # check columns name
        log_dict[key]['column_check'] = 'Check Pass'
        for col in link_list:
          if col not in data_head or col not in conf_head:
            log_dict[key]['column_check'] = 'Check Failed'
            comment += '''Required link column: {} is not provided. '''.format(col)
            break

          if chk_dup(col, data_head) or chk_dup(col, conf_head):
            log_dict[key]['column_check'] = 'Check Failed'
            comment += '''Duplicate link column: {} is not provided. '''.format(col)
            break

        if log_dict[key]['column_check'] == 'Check Pass':
          for col in std_col:
            if col not in data_head and mapping_head[col] not in data_head:
              log_dict[key]['column_check'] = 'Check Failed'
              comment += '''Required column: {} is not provided. '''.format(col)
              break

      else:
        log_dict[key]['column_check'] = 'Not Checked'

      log_dict[key]['comment'] = comment
      log_dict[key]['upload_user'] = user_name

      if log_dict[key]['ready_upload'] == 'Y':
        # upload files

        # -------- Update the full columns list, in the 'system_conf' collection
        updated_full_list = set(full_list).union(set(data_head))
        self.db.system_conf.find_one_and_update({}, {"$set": {"full_cols": list(updated_full_list)}})

        # ----------- Update the conf columns list, in the 'system_conf' collection
        updated_conf_list = set(conf_list).union(set(conf_head))
        self.db.system_conf.find_one_and_update({}, {"$set": {"conf_cols": list(updated_conf_list)}})

        #-------------Update all existing conf files in conf_file if new column (key) is coming

        if len(updated_conf_list) > len(conf_list) and len(conf_list) != 0:
          for col in updated_conf_list:
            if col not in conf_list:
              self.db.conf_file.update_many({}, {"$set": {col: ""}})

        # ---------delete duplicate files----------------------------
        if log_dict[key]['number_of_check'] != 1:
          # -----------delete existing data file from gridfd and collection data_file
          del_data_file = self.db.data_file.find(
            {'upload_key': key, 'doe_name': doename, 'program': program, 'record_mode': recordmode,
             'read_only': readonly})
          count = 0
          count_dfile = 0
          if del_data_file.count() > 0:
            for f in del_data_file:
              del_file_id = f.get('data_file_id')
              if del_file_id is not None:
                fs.delete(del_file_id)
                count += 1
                result = self.db.data_file.delete_many({'data_file_id': del_file_id})
                count_dfile += result.deleted_count
              else:
                sys_mgs += '''System error, can't find and delete existing data file: {}. '''.format(del_file_id)
            sys_mgs += '''Delete data file record from detdp database gridfs collection, # of deleted records: {} '''.format(
              count)
            sys_mgs += '''Delete data file index record from data_file collection, # of deleted records: {} '''.format(
              count_dfile)
          # ------------delete existing conf file from collection conf_file
          result = self.db.conf_file.delete_many(
            {'upload_key': key, 'doe_name': doename, 'program': program, 'record_mode': recordmode,
             'read_only': readonly})
          sys_mgs += '''Delete conf file record from conf_file collection, # of deleted records: {} '''.format(
            result.deleted_count)

        # ------Open files for add new files into system-----------------------------------------------------
        with open(path + data_name, 'rb') as data_file:
          with open(path + conf_name, 'rb') as conf_file:
            data_file.seek(0)
            conf_file.seek(0)

            # ------- Insert new data file into gridfs and an index file into 'data_file' collection
            data_file.seek(0)
            data_file_id = fs.put(data_file)
            temp = fs.find_one(filter=data_file_id)
            data_dict = {'doe_name': doename,
                         'program': program,
                         'record_mode': recordmode,
                         'read_only': readonly,
                         'upload_user': user_name,
                         'upload_date': timestamp,
                         'checkIn_date': log_dict[key]['checkIn_date'],
                         'file_size': str(float("{0:.2f}".format(temp.length / 1024.00 / 1024.00))) + 'MB',
                         'data_file_id': data_file_id,
                         'upload_key': key}
            self.db.data_file.insert_one(data_dict)

            # -------- Insert conf file into the 'conf_file' collection
            conf_file.seek(0)
            reader = unicodecsv.reader(conf_file)
            conf_file_cols_list = reader.next()
            conf_file_cols_list = [x.lower().encode('ascii', 'ignore') for x in conf_file_cols_list]
            conf_file_cols_list = [x if mapping_head.get(x) is None else mapping_head.get(x) for x in
                                   conf_file_cols_list]
            reader = unicodecsv.DictReader(conf_file, fieldnames=conf_file_cols_list)
            for row in reader:
              row['doe_name'] = doename
              row['program'] = program
              row['record_mode'] = recordmode
              row['read_only'] = readonly
              row['upload_key'] = key
              self.db.conf_file.insert_one(row)
        # ------Close opened files
        log_dict[key]['upload_date'] = timestamp
        log_dict[key]['status'] = 'Uploaded'
      else:
        log_dict[key]['upload_date'] = None
        log_dict[key]['status'] = 'Check Failed'

      log_dict[key]['status_date'] = timestamp

      if log_dict[key]['number_of_check'] == 1:
        self.db.auto_upload_log.insert_one({'key': key, 'log': log_dict[key]})
      else:
        self.db.auto_upload_log.update_one({'key': key}, {'$set': {'log': log_dict[key]}})

      print 'File: {} -- System Message: {}'.format(key, sys_mgs)


def chk_dup(value, lst):
  count = 0
  for i in range(len(lst)):
    count += 1 if lst[i] == value else 0
    if count > 1:
      return True
  return False


# if __name__ == '__main__':
#   dp = detdpautoupload()
#   dp.get_file('SysAuto')

  # std = dp.db.system_conf.find_one({}).get('standard_cols')
  # new_std = [x.lower() for x in std]
  # dp.db.system_conf.find_one_and_update({},{'$set':{'standard_cols':new_std}})
