# @blueshit/aliyun-sts

轻量级阿里大于短信客户端，不依赖任何第三方库，体验飞一般的感觉

## 安装

```bash
npm i @blueshit/aliyun-sms -S
```

## 使用

```javascript
const Alidayu = require("@blueshit/aliyun-sms");

// 初始化客户端
const client = new Alidayu({
  AccessKeyId: 'Your-AccessKeyId',
  AccessKeySecret: 'Your-AccessKeySecret'
});

// 发送短信
client.sms({
  phone: 13800138000,
  sign: '签名',
  template: 'SMS_8xxxxx',
  params: { user: 'Yourtion' },
})
.then(console.log)
.catch(console.log);
```

详情参数指定

```javascript
/**
* 发送短信
* @param {object} option 发送短信配置
* @param {number} option.phone 手机号
* @param {string} option.sign 签名
* @param {string} option.template 模版
* @param {object} option.params 模版参数
* @return {promise}
*/
sms(option, callback)
```

## 授权协议

The MIT License
