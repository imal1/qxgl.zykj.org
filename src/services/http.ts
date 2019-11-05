import axios from "axios";
export function getUrlSearch(name: any) {
  let search = encodeURI(window.location.search);
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = search.substr(1).match(reg);
  if (r !== null) {
    return unescape(r[2]);
  }
  return null;
}
class Http {
  static _instance: any;
  static get instance() {
    if (Http._instance) {
      return Http._instance;
    }
    let schoolCode = getUrlSearch("code");
    let token = getUrlSearch("token");
    Http._instance = axios.create({
      baseURL: "http://api.note.zykj.org/services",
      responseType: "json",
      timeout: 30000,
      headers: {
        ApiHost: `http://${schoolCode}.api.zykj.org/api`,
        Token: `Bearer ${token}`,
        'Fn-Code': `${schoolCode}`,
        'Fn-Auth-Token': `Friday ${token}`
      }
    });
    return Http._instance;
  }
}

export default Http;
