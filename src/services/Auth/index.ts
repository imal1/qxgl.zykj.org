import Http, { getUrlSearch } from "../http";
import IStudentAuthResult from "./dto/IStudentAuthResult";
import IUpdateStudentsAuthDto from "./dto/IUpdateStudentsAuthDto";

class Auth {
  public async getStudentsAuth(): Promise<IStudentAuthResult[]> {
    let res = await Http.instance.get(
      "/auth/GetStudentsAuth?schoolCode=" + getUrlSearch("code")
    );
    return res.data.data;
  }

  public async updateStudentsAuth(data: IUpdateStudentsAuthDto): Promise<void> {
    let res = await Http.instance.post("/auth/UpdateStudentsAuth", data);
  }
}

export default new Auth();
