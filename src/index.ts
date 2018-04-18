/**
 * @file Alidayu SDK
 * @author Yourtion Guo <yourtion@gmail.com>
 *
 * 阿里云短信发送接口 nodejs 版本
 * 阿里云短信API官方文档: https://help.aliyun.com/document_detail/56189.html?spm=5176.doc55288.6.567.JQseDW
 */

import assert from 'assert';
import crypto from 'crypto';
import url from "url";
import http from "http";
import querystring from "querystring";

export interface IOption {
  AccessKeyId: string;
  AccessKeySecret: string;
}

export interface IRespond {
  Message: string;
  RequestId: string;
  BizId: string;
  Code: string;
}

export interface ISMSOption {
  phone: string | number; // 手机号
  sign: string; // 签名
  template: string; // 模版
  params?: object; // 模版参数
}

interface HttpResponse extends http.IncomingMessage {
  body: any;
  json: any;
}

/**
 * 阿里云短信服务 - 阿里大于
 */
export default class Alidayu {

  private options: any;

  /**
   * 构造函数
   * @param {IOption} options - 配置项
   * @param {string} options.AccessKeyId - 秘钥 AccessKeyId
   * @param {string} options.AccessKeySecret - 秘钥A ccessKeySecret
   */
  constructor(options: IOption) {
    assert(typeof options.AccessKeyId === 'string', '请配置 AccessKeyId');
    assert(typeof options.AccessKeySecret === 'string', '请配置  AccessKeySecret');
    this.options = Object.assign({
      Format: 'JSON',
      SignatureMethod: 'HMAC-SHA1',
      SignatureVersion: '1.0',
      Action: 'SendSms',
      Version: '2017-05-25',
      RegionId: 'cn-hangzhou',
    }, options);
  }

  private request(options: http.RequestOptions, body: string, json: boolean = true) {
    return new Promise<any>((resolve, reject) => {
      const req = http.request(options, res => {
        res.on("error", err => reject(err));
        const list: Buffer[] = [];
        res.on("data", chunk => list.push(chunk as Buffer));
        res.on("end", () => {
          const res2 = res as HttpResponse;
          res2.body = Buffer.concat(list).toString();
          if (json) {
            res2.json = JSON.parse(res2.body);
          }
          resolve(res2);
        });
      });
      req.on("error", err => reject(err));
      req.end(body);
    });
  }

  /**
   * 短信接口签名算法函数
   * @param {object} param - 发送短信的参数
   * @param {string} secret - 阿里短信服务所用的密钥值
   * @return {string}
   */
  private signParameters(param: any, secret: string) {

    const signData = Object.keys(param).sort().map((k) => {
      return encodeURIComponent(k) + '=' + encodeURIComponent(param[k]);
    }).join('&');

    const StringToSign = `POST&%2F&${ encodeURIComponent(signData) }`;
    return crypto.createHmac('sha1', secret + '&').update(new Buffer(StringToSign, 'utf-8')).digest('base64');
  }

  /**
   * 阿里云短信发送接口
   * @param {object} params - 发送短信的参数
   */
  private sendMessage(params: object) {
    const _param = Object.assign(params, this.options, { SignatureNonce: '' + Math.random(), Timestamp: new Date().toISOString() });
    delete _param.AccessKeySecret;
    _param.Signature = this.signParameters(_param, this.options.AccessKeySecret);
    const reqParams: http.RequestOptions = {
      method: "POST",
      hostname: "dysmsapi.aliyuncs.com",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    return this.request(reqParams, querystring.stringify(_param), true);
  }

  /**
   * 发送短信
   * @param {ISMSOption} option 发送短信配置
   * @param {number} option.phone 手机号
   * @param {string} option.sign 签名
   * @param {string} option.template 模版
   * @param {object} option.params 模版参数
   */
  public sms(option: ISMSOption): Promise<IRespond> {
    const _option = {
      PhoneNumbers: option.phone,
      SignName: option.sign,
      TemplateCode: option.template,
      TemplateParam: '',
    };
    if(option.params) _option.TemplateParam = JSON.stringify(option.params);
    return this.sendMessage(_option).then(({ json }) => {
      if(json && json.Message === 'OK') return json;
      throw new Error(json.Message);
    });
  }
}
