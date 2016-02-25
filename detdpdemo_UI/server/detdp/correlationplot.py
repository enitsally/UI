import pandas as pd
import statsmodels.api as smapi
import matplotlib.pyplot as plt
from statsmodels.sandbox.regression.predstd import wls_prediction_std
import math
import time
from datetime import datetime
import os


class linearregression:
    def __int__(self):
        pass

    def get_data(self, df, dim, param_x, ll_x, ul_x, param_y, ll_y, ul_y, p_value_limit, user, image_path, url_path, file_name):
        # path = 'input/test.csv'
        # with open(path, 'rb') as file:
        #     df = pd.read_csv(file)
        #
        # dim = 'DOE#'
        # param_x = 'ShSNR (dB)'
        # param_y = 'ShEM (dec)'
        # ll_x = 8
        # ll_y = 1.5
        # ul_x = 100000
        # ul_y = 100000
        # p_value_limit = 0.5

        if not os.path.exists(image_path):
            os.makedirs(image_path)

        dim_values = df[dim].unique()
        dim_grouped = df.groupby(dim)
        result_dict = []
        for dv in dim_values:
            tmp = {}
            tmp[dim] = dv
            df_dim_value = dim_grouped.get_group(dv)
            axis_x = list(df_dim_value[param_x])
            axis_y = list(df_dim_value[param_y])
            axis_X = smapi.add_constant(axis_x)
            total_data_vol = len(axis_y)
            tmp['total_data_size'] = total_data_vol

            data = smapi.OLS(axis_y, axis_X).fit()
            tmp['rd_params'] = list(data.params)
            tmp['rd_r_sqr'] = data.rsquared
            tmp['rd_rmse'] = math.sqrt(data.mse_resid)

            prstd, iv_l, iv_u = wls_prediction_std(data)

            plt.style.use('ggplot')
            figure, axes = plt.subplots(ncols=3, nrows=1)

            # manager = plt.get_current_fig_manager()
            # manager.window.showMaximized()
            figure.suptitle('{} "{}" (Data Size: {})'.format(dim, dv, total_data_vol), fontsize=14)
            figure.set_size_inches(14.5,4.5)

            ax, ax_wo_user_outlier, ax_wo_algor_outlier = axes.ravel()
            ax.plot(axis_x, axis_y, 'o', label="Data")

            # OLS
            ax.plot(axis_x, data.fittedvalues, 'b-', label="OLS")
            ax.plot(axis_x, iv_u, 'y--')
            ax.plot(axis_x, iv_l, 'y--')
            ax.legend(loc="best");
            #
            # figure = smgraph.regressionplots.plot_fit(data, 0, ax=ax)
            ax.set_xlabel(param_x)
            ax.set_ylabel(param_y)
            ax.set_title("Linear Regression - raw data", fontsize = 10)
            # ax.text(0, 0, 'Total Data Size :{}'.format(total_data_vol), horizontalalignment='left',
            #         verticalalignment='bottom', transform=ax.transAxes)

            # ---------------without user outlier------------
            wo_user_outlier = [(axis_x[i], axis_y[i]) for i in range(total_data_vol) if
                               (axis_x[i] >= ll_x and axis_y[i] >= ll_y and axis_x[i] <= ul_x and axis_y[i] <= ul_y)]
            user_outlier = [(axis_x[i], axis_y[i]) for i in range(total_data_vol) if
                            (axis_x[i] < ll_x or axis_y[i] < ll_y or axis_x[i] > ul_x or axis_y[i] > ul_y)]
            if len(wo_user_outlier) > 0:
              axis_x_wo_user_outlier, axis_y_wo_user_outlier = map(list, zip(*wo_user_outlier))
            else:
              axis_x_wo_user_outlier, axis_y_wo_user_outlier = [], []
            # wo_user_outlier_x, wo_user_outlier_y = map(list, zip(*user_outlier))
            axis_X_wo_user_outlier = smapi.add_constant(axis_x_wo_user_outlier)
            total_data_wo_user_outlier_vol = len(axis_y_wo_user_outlier)
            tmp['total_data_size_uo'] = total_data_wo_user_outlier_vol
            tmp['uo_size'] = len(user_outlier)
            tmp['uo_value'] = user_outlier

            #
            data_wo_user_outlier = smapi.OLS(axis_y_wo_user_outlier, axis_X_wo_user_outlier).fit()
            tmp['uo_params'] = list(data_wo_user_outlier.params)
            tmp['uo_r_sqr'] = data_wo_user_outlier.rsquared
            tmp['uo_rmse'] = math.sqrt(data_wo_user_outlier.mse_resid)

            prstd_wo_user_outlier, iv_l_wo_user_outlier, iv_u_wo_user_outlier = wls_prediction_std(data_wo_user_outlier)

            ax_wo_user_outlier.plot(axis_x_wo_user_outlier, axis_y_wo_user_outlier, 'o', label="Data")

            # OLS
            ax_wo_user_outlier.plot(axis_x_wo_user_outlier, data_wo_user_outlier.fittedvalues, 'b-', label="OLS")
            ax_wo_user_outlier.plot(axis_x_wo_user_outlier, iv_u_wo_user_outlier, 'y--')
            ax_wo_user_outlier.plot(axis_x_wo_user_outlier, iv_l_wo_user_outlier, 'y--')

            ax_wo_user_outlier.legend(loc="best");

            ax_wo_user_outlier.set_xlabel(param_x)
            ax_wo_user_outlier.set_ylabel(param_y)
            ax_wo_user_outlier.set_title("Linear Regression - wo - User Outlier", fontsize = 10)

            # ax_wo_user_outlier_position = ax_wo_user_outlier.get_position()
            # print 'location:',ax_wo_user_outlier_position
            # left = ax_wo_user_outlier_position.x0
            # bottom = ax_wo_user_outlier_position.y0
            # ax_wo_user_outlier.plot (ax_wo_user_outlier_position.x0, ax_wo_user_outlier_position.y0, 'b*')

            # str = 'Outlier: {}, Pert: {}%'.format(len(user_outlier), len(user_outlier) + 0.0000 / total_data_vol * 100)
            # ax_wo_user_outlier.text(left, bottom, str, fontsize=12)

            # ------------without algor outlier-----------

            algor_test = data_wo_user_outlier.outlier_test()
            algor_outliers = [(axis_x_wo_user_outlier[i], axis_y_wo_user_outlier[i]) for i, t in
                              enumerate(algor_test[:, 2]) if t < p_value_limit]
            algor_wo_outliers = [(axis_x_wo_user_outlier[i], axis_y_wo_user_outlier[i]) for i, t in
                                 enumerate(algor_test[:, 2]) if t >= p_value_limit]
            if len(algor_wo_outliers)> 0:
              axis_x_wo_algor_outlier, axis_y_wo_algor_outlier = map(list, zip(*algor_wo_outliers))
            else:
              axis_x_wo_algor_outlier, axis_y_wo_algor_outlier = []
            # algor_outliers_x, algor_outliers_y = map(list, zip(*algor_outliers))
            axis_X_wo_algor_outlier = smapi.add_constant(axis_x_wo_algor_outlier)
            total_data_wo_algor_outlier_vol = len(axis_y_wo_algor_outlier)

            tmp['total_data_size_ao'] = total_data_wo_algor_outlier_vol
            tmp['ao_size'] = len(algor_outliers)
            tmp['ao_value'] = algor_outliers

            data_wo_algor_outlier = smapi.OLS(axis_y_wo_algor_outlier, axis_X_wo_algor_outlier).fit()

            tmp['ao_params'] = list(data_wo_algor_outlier.params)
            tmp['ao_r_sqr'] = data_wo_algor_outlier.rsquared
            tmp['ao_rmse'] = math.sqrt(data_wo_algor_outlier.mse_resid)

            prstd_wo_algor_outlier, iv_l_wo_algor_outlier, iv_u_wo_algor_outlier = wls_prediction_std(
                data_wo_algor_outlier)

            # figure_wo_algor_outlier, ax_wo_algor_outlier = plt.subplots()

            ax_wo_algor_outlier.plot(axis_x_wo_algor_outlier, axis_y_wo_algor_outlier, 'o', label="Data")

            # OLS
            ax_wo_algor_outlier.plot(axis_x_wo_algor_outlier, data_wo_algor_outlier.fittedvalues, 'b-', label="OLS")
            ax_wo_algor_outlier.plot(axis_x_wo_algor_outlier, iv_u_wo_algor_outlier, 'y--')
            ax_wo_algor_outlier.plot(axis_x_wo_algor_outlier, iv_l_wo_algor_outlier, 'y--')

            ax_wo_algor_outlier.legend(loc="best");

            ax_wo_algor_outlier.set_xlabel(param_x)
            ax_wo_algor_outlier.set_ylabel(param_y)
            ax_wo_algor_outlier.set_title("Linear Regression - wo - Algor Outlier", fontsize = 10)
            # ax_wo_algor_outlier.text(0, 0, 'Total Data Size :{}, Outlier: {}, Pert: {}%'.format(
            #     total_data_wo_algor_outlier_vol, len(algor_outliers),
            #     len(algor_outliers) + 0.0000 / (len(algor_outliers) + total_data_wo_algor_outlier_vol) * 100),
            #                          horizontalalignment='left', verticalalignment='bottom', transform=ax.transAxes)

            # plt.show()

            fig_name = "{}/{}_{}_{}.png".format(image_path,user,dv,file_name)
            url_name = "{}/{}_{}_{}.png".format(url_path,user,dv,file_name)
            tmp['image_path'] = url_name
            result_dict.append(tmp)
            figure.savefig(fig_name, dpi=100)
            plt.close('all')

        corr_info = {'param_x': param_x,
                     'll_x': ll_x,
                     'ul_x': ul_x,
                     'param_y': param_y,
                     'll_y':ll_y,
                     'ul_y':ul_y,
                     'p_value_limit': p_value_limit
                     }

        return {'result_dict': result_dict, 'corr_info': corr_info}
if __name__ == '__main__':
    obj = linearregression()
    path = '//mapserverdev/DETDP/Images/test.csv'
    with open(path, 'rb') as file:
        df = pd.read_csv(file)

    dim = 'DOE#'
    param_x = 'ShSNR (dB)'
    param_y = 'ShEM (dec)'
    ll_x = 8
    ll_y = 1.5
    ul_x = 100000
    ul_y = 100000
    p_value_limit = 0.5
    user = 'test'
    timestamps = time.strftime('%Y%m%d%H%M%S')
    image_path = '//mapserverdev/DETDP/Images'
    url_path = '//mapserverdev/DETDP/Images'
    result = obj.get_data(df,dim,param_x,ll_x,ul_x,param_y,ll_y, ul_y,p_value_limit,user,image_path,url_path,'test_only')
    print result
