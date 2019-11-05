import axios from "axios";
import Http, { getUrlSearch } from "../http";

class Courseware {
    public async getallPPT(): Promise<any> {
        let res = await Http.instance.get("courseware/getallppt");
        return res.data.data;
    }

    public async uploadPPT(data: {
        uuid: string;
        filetype: string;
        file: File;
    }): Promise<any> {
        const { uuid, filetype, file } = data;
        let formData = new FormData();
        formData.append("pptfile", file);
        let instance = axios.create({
            responseType: "json",
            timeout: 30000
        });
        let res = instance.post(
            `http://116.62.121.164/upload?name=${uuid}&type=${filetype}`,
            formData
        );
        return res;
    }

    public async addPPT(data: any): Promise<any> {
        let res = await Http.instance.post("courseware/add", data);
        return res.data.data;
    }

    public async deletePPT(data: any): Promise<any> {
        let res = await Http.instance.post("courseware/delete", data);
        return res.data.data;
    }
}

export default new Courseware();
