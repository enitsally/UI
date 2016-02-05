# DET Data Process Application - User Manual

:fireworks: Version:  1.0.

:tada: Tips : Pay attention to right corn, information pop up.

## Application menu

After login, users will be directed to `Work File Upload` page. Administration user will be pointed to `Data Setting` page.

  - `Menu` : first left icon at the left corner,  ![Alt text](/app/images/icon/menu.png)
  - `Logout` : first right icon at right corner,  ![Alt text](/app/images/icon/logout.png)
  - `Help` : second to the right icon at right corner,  ![Alt text](/app/images/icon/help.png)

On the Menu panel, the logged in user name are showed, with the user group description.
  - No login : icon shows no logged in user, ![Alt text](/app/images/icon/account_off.png)
  - logged in : icon shows user has logged in, ![Alt text](/app/images/icon/account_circle.png)

## Work File Upload Page

###### Tab - File Upload
User could upload experiment work files to the system. One experiment may have multiple sub work files to upload. System assign `Experiment ID` and `Sub File ID` automatically. `Experiment ID` and `Sub File ID` are immutable (Once created, no possibility to change). Input attributes for the one experiment are:

  - `Record Mode` : Selection required.
  - `Program` : Selection required.
  - `Experiment Type` : Selection required.
  - `Read Only / Full Device` : Selection required.
  - `Project` : Input required.
  - `Tester` : Input optional.
  - `Comment` : Input optional.

  - `Reset` : To clear all the input, as well as the file upload queue.

Use `Choose Files` button to add new files to the experiments, multiple files selection are supported. Enter description for each file or remove files from the uploading queue.
Upload all the selected files using `Upload all` button or clear all using `Remove all` button.

After uploading, `Confirm` the action or `Cancel` it from the pop up dialog window.
User only upload experiments files based on user names.

###### Tab - Upload Summary
User could overview, search and modify its own uploaded experiment files here. Default show period is last three months.

  - `Start Date` : Search input for start date.
  - `End Date` : Search input for end date.
  - `Search` : Search button for filter shown experiments by selected data scope.
  - `Shown Period` : Filter shown experiments by various selections, last three months, last six months, last one year, and all.
  - `Show Summary` : Show or hide the user work file overview.

For each file, using `Delete` button on the Action column to remove the entire experiment, including the sub work files. Caution dialog will be show to let user `Confirm` or `Cancel` the remove experiment action. Using `Edit` button to see the sub work files that attached to the selected experiment, as well as remove and add files into the current experiment.

 - `Remove` : Files have to be removed one by one, using the `Save` button to save the action to database, otherwise, it is only actions in session, using `Reset` button to go back to original sub work file set.
 - `Add` : Similar actions with adding new sub work files to new experiment, see section [Tab-File Upload](###### Tab - File Upload)

Use the `Reset` button or `Show Summary` check box to go back to overview.

## Work File Concat Page
Page show all the experiments and its sub work files for all the users. It provide the same search function in the upload page, section [Upload Summary](###### Tab - Upload Summary).

For each experiments, using `Detail` button to see the list of sub work files or `Add to` button to add the entire experiment, including the sub work files into the concat list on the bottom portion. by default, the character **'*'** to represent selecting all sub work files.

For concat work files, user could add multiple experiment into the concat list using `Add Experiment` button to add one line item on the bottom portion, or delete one from the list by `Delete` button.
The atomic pair for concat is experiment user, experiment number and sub experiment number.

 - `Experiment User` : Input for experiment owner.
 - `Experiment Number` : Input for experiment number.
 - `Sub Experiments` : Input for list of sub work files, use character **','** for delimiter for a set of sub experiments, use the character **'*'** to select all sub work files.

 - `Concat` : Button on the top to perform concat. The successful concat will return the file name to the user and user could locate the created file [\\\\mapserverdev\DETDP\Retrieve_Files](\\172.18.60.20\DETDP\Retrieve_Files) (Enter this address into your fold path).

Use the `Reset` button or `Show Summary` check box to go back to overview.

>:tada:Tips:
>- Using "Add to" button for each experiment to avoid manual error typos for experiment owner and experiment number and then modify the sub experiment number as needed.

>- Concat file followed the naming convention, e.g. 'user_concat_timestamps'

## Test File Retrieve Page

###### Tab - File Summary

User could overview the uploaded test files here. Default show period is last three months. One record is only attached to one configuration file from the system database. The **'DOE File Name'** should be the unique identifier. DOE File Name is abstracted from the uploading process. (Auto upload or manual upload by admin)

  - `Record Mode` : Search selection for record mode.
  - `Program` : Search selection for Program.
  - `Read Only / Full Device` : Search selection for record type.
  - `DOE File Name` : Search input for one DOE configuration by file name.
  - `Start Date` : Search input for start date.
  - `End Date` : Search input for end date.
  - `Search` : Search button for filter shown experiments by selected data scope.

  - `Shown Period` : Filter shown experiments by various selections, last three months, last six months, last one year, and all.

For each DOE file, using `Add to` button to add this DOE file into the Retrieve list, for the entire DOE, combined with the parameters filter set up, see section [Tab - File Retrieve](###### Tab - File Retrieve).

Use `Reset` button to clear all the search conditions.

###### Tab - File Retrieve

User could merge test files (both data and configuration files) based on the selection of retrieving conditions. By default, the page only hide the detail configuration file content for the last three months. Check `Show Conf.File Summary` to show them and choose from `Shown Period` for change the time scope of data, last three months, last six months, last one year, and all.

The configuration file summary table support filter by column, just click the right part of each column. It also support paging.

For file retrieving, user should setup conditions of merging. All the conditions can be left to empty if no preferred filter for this conditions. For each condition, the multiple input are delimited by character **','**. Multiple input values will give a summarized return result.

  - `Record Mode` : Retrieve file by record mode.
  - `Program` : Retrieve file by Program.
  - `Read Only / Full Device` : Retrieve file by record type.
  - `DOE#` : Retrieve file by DOE number, match the column in the configuration file summary table.
  - `Design#` : Retrieve file by design, match the column in the configuration file summary table.
  - `Parameters` : Retrieve file by various Parameters.

    + Select one parameter from the list and click `Add` button to add the parameter into the condition pool.
    + Input the values for the added parameter, multiple values are separated by character **','**.
    + Delete one parameter from the condition pool using `Delete` button.

User could also configure the retrieved file format by choosing from the check boxes

  - `Full File` : return a retrieved file with full columns list.
  - `Customized File` : return a retrieved file with user Customized columns list.
  - `Standard File` : return a retrieved file with user Standard columns list.

Customized and Standard columns list should be set up before retrieving in the section [User Setting](## User Setting), otherwise, system won't return the retrieved file.

After setting up the condition for retrieving, using `Retrieve` button on the top to perform selected files merging that satisfy all the set conditions. The successful retrieving will return the file name to the user and user could locate the created file [\\\\mapserverdev\DETDP\Retrieve_Files](\\172.18.60.20\DETDP\Retrieve_Files) (Enter this address into your fold path).

>:tada:Tips:
>- Duplicated selection of the same parameter represent as combination that drive the return result.

>- Retrieved file followed the naming convention, e.g. 'user_STANDARD_timestamps', 'user_CUSTOMIZED_timestamps', 'user_FULL_timestamps'

## User Setting

User could set up user owned standard / Customized columns list from the full columns list in the system. To add columns, type the name in the top part 'Search for a column name' and the system will list all the matching name for selection. To delete columns, click the **'X'** at the end of column name.

  - `Show Full System Columns List` : Show / Hide full columns list that current stored in the system.
  - `Get Sys.Standard` : Copy System standard columns list to user owned standard / Customized columns list.
  - `Save` : Save the operations to database.
  - `Reset` : clear all the current operations and go back to the original version before saving.

>:tada:Tips:
>- Always remember to click 'Save' to store the new modified list to database.

>- System not allowed to enter a columns that not exists in the system, always select from searching list.

## Test File Upload Log

Page show the log information for testing files uploading (Auto upload or manual upload by admin). By default, it only list the log information for the last three months. The comment show detail upload information for each data and configuration file.

- `Start Date` : Search input for start date.
- `End Date` : Search input for end date.
- `Search` : Search button for filter shown experiments by selected data scope.
- `Shown Period` : Filter shown experiments by various selections, last three months, last six months, last one year, and all.
- `Reset` : Clear the time scope selection.

In case if need to manual upload test file from default location, go to `Manual Operation` tab to click the button.

*****

## System setting - Administrator Only

#### Standard Setting

Administrator need to set up system standard columns list when the project started. Auto upload or manual upload for test files (data and configuration file) need to check whether the uploaded files have the system standard columns. To add columns, type the name in the top part 'Search for a column name' and the system will list all the matching name for selection. If no matching columns list pop up, manual input is also accepted. To delete columns, click the **'X'** at the end of column name.

  - `Show Full System Columns List` : Show / Hide full columns list that current stored in the system.
  - `Save` : Save the operations to database.
  - `Reset` : Clear all the current operations and go back to the original version before saving.

>:tada:Tips:
>- Always remember to click 'Save' to store the new modified list to database.

>- System allowed to enter a columns that not exists in the system, ATTENTION for typos.This is only for administrator to set up at the very beginning.

#### Data Setting

Administrator could set up 'Program / Record Mode' pair and 'Experiment Type' in the data setting page. Different tab page will be similar information for 'Program / Record Mode' pair and 'Experiment Type'.

  - `Create New Row` : Add one new record into the information list from the left part.

    + Input Values for information fields.
    + Click `Add Row` button to add into list on the right side.


  - `Edit` : The current values will be automatically showed on the left part for modifications.

    + Modified the information fields as needed.
    + Click 'Save change' button to save into list on the right side.


  - `Delete` : Delete the selected record from the list on the right side.
  - `Save` : Save the modifications to database.
  - `Reset` : Clear all the current operations and go back to the original version before saving.

>:tada:Tips:
>- Always remember to click 'Save' to store the new modified list to database.

#### Column Mapping

Administrator could set up 'Column Mapping' for legacy columns name changed problem. The system will automatically mapping the new columns to the old columns and replace it for user retrieved files. The mapping only work for data files.

Operation are similar to section [Data Setting](#### Data Setting).

#### File Upload Setting

Administrator have to set up 'Auto-upload configuration' for test file uploading.

  - Upload File Prefix : Define the file name prefix for both data file and configuration file. By default, data file prefix is **data** and configuration file prefix is **conf**.
  - Linkage Columns : Define the linking columns list that merging the data file and the corresponding configuration file.  

Operation are similar to section [Data Setting](#### Data Setting).

>:tada:Tips:
>- Always remember to click 'Save' to store the new modified list to database.


## Auto Upload Rules
  1. Test file naming convention : *'part1_part2_part3_part4_part5'*.   **ALL lower case**.

    - Part 1: prefix for data file or configuration file that matching system setup.
    - Part 2: name of program name that existing in the system.
    - Part 3: name of record mode that existing in the system.
    - Part 4: 'y' for read only and 'n' for full device.
    - Part 5: unique name for this file.(Same for the data and configuration file pair)

  2. Data file and configuration file should have the same file name, except for the prefix part (part 1).

  3. Data file and configuration file both have columns for Linkage as system set up, see section [File Upload Setting](#### File Upload Setting).

  4. Data file also have the standard columns lists that system stored, see section [Standard Setting](#### Standard Setting)

  5. Both data file and configuration file should be placed on the folder [\\\\mapserverdev\DETDP\Upload_Files](\\172.18.60.20\DETDP\Upload_Files) (Enter this address into your fold path).

  6. If same data file and configuration file exiting in the system (checking by file name), system will replace the current files and write to log for duplicates.

  7. Upload log will be stored daily as _csv_ file in the same location. Name convention is *'user_UplaodMethod_log_timestamps'*. Log files will be deleted 60 days later.

  8. If upload succeed, system will delete the uploaded files from the location. If not, system will leave it as it is. The server will regard it as garbage to delete later (7 days).


>:tada:Tips:
>- Example for data file name: data_apollo_cmr_n_DOE976WFTY.csv.

>- Example for corresponding configuration file name: conf_apollo_cmr_n_DOE976WFTY.csv.

>- Example for system log file name: Sys_auto_log_20160116110034.csv

>- Example for administrator manual upload log file name: Admin_manual_log_20160116110034.csv
