import React from "react";
import "./App.css";

import {
  message,
  Spin,
  Divider,
  Select,
  Button,
  Switch,
  Empty,
  Row,
  Col,
  List,
  Icon,
  Modal
} from "antd";

import "antd/dist/antd.min.css";

import Auth from "./services/Auth";
import CoursewareApi from "./services/Courseware";
import classnames from "classnames";
import IStudentAuthResult, {
  IStudent
} from "./services/Auth/dto/IStudentAuthResult";
import { getUrlSearch } from "./services/http";
import { cloneDeep, get, endsWith, reverse } from "lodash-es";

const uuidv1 = require('uuid/v1');
const Option = Select.Option;
const { Item } = List;
const { Meta } = Item;

interface IAppState {
  data?: IStudentAuthResult[];
  currentClass?: IStudentAuthResult;
  listData?: any;
  currentPage?: number;
  inputKey: string;
}

class App extends React.Component<any, IAppState> {
  public uploadInput: any;
  state: IAppState = {
    data: void 0,
    listData: void 0,
    currentClass: void 0,
    currentPage: 1,
    inputKey: ''
  };

  changeClass = (v: any) => {
    const { data } = this.state;
    if (data) {
      const found = data.find(n => n.classId === v);
      if (found) {
        this.setState({
          currentClass: found
        });
      }
    }
  };

  renderGradeSelect = () => {
    const { data, currentClass } = this.state;
    if (data && currentClass) {
      return (
        <Select
          defaultValue={currentClass.classId}
          className="fl"
          onChange={this.changeClass}
        >
          {data.map(c => {
            return (
              <Option value={c.classId}>
                {c.grade + `(${c.className})` + "班"}
              </Option>
            );
          })}
        </Select>
      );
    } else {
      return null;
    }
  };

  changePolicy = async (s: IStudent, checked: boolean) => {
    const { data } = this.state;
    if (!data) {
      return;
    }
    let classIndex: number = -1,
      sIndex: number = -1;
    for (let i = 0; i < data.length; i++) {
      for (let y = 0; y < data[i].students.length; y++) {
        if (data[i].students[y].id === s.id) {
          classIndex = i;
          sIndex = y;
          break;
        }
      }
    }
    if (classIndex > -1 && sIndex > -1) {
      try {
        if (!getUrlSearch("code")) {
          return message.error("缺少学校代码")
        }
        let c = cloneDeep(s);
        c.policy = checked;
        await Auth.updateStudentsAuth({
          schoolCode: getUrlSearch("code") as string,
          students: [c]
        });
        data[classIndex].students[sIndex].policy = checked;
        this.setState({
          data
        });
      } catch (e) {
        return message.error(e.message);
      }
    }
  };

  renderStudentCard = (s: IStudent) => {
    let cls = classnames({
      "student-card": true,
      active: s.policy
    });
    return (
      <div className={cls}>
        <div className="name">{s.fullName}</div>
        <div>{s.policy ? "已开启权限" : "未开启权限"}</div>
        <div className="clearfix">
          <Switch
            checked={s.policy}
            className="fr"
            onClick={(checked: boolean) => this.changePolicy(s, checked)}
          />
        </div>
      </div>
    );
  };

  renderStudentCards = () => {
    const { currentClass } = this.state;
    if (currentClass && currentClass.students.length > 0) {
      let count = 6;
      let ratio = Math.floor(currentClass.students.length / count);
      let m = currentClass.students.length % 6;
      let arr: any[] = [];
      if (ratio > 0) {
        for (let i = 0; i < ratio; i++) {
          arr.push([...currentClass.students.slice(i * count, i * count + 6)]);
        }
        if (m > 0) {
          let lest = currentClass.students.slice(ratio * count);
          arr.push([...lest]);
        }
      } else {
        arr.push([...currentClass.students]);
      }

      return (
        <div className="student-cards">
          {arr.map((a, index) => {
            return (
              <Row key={index} gutter={2}>
                {a.map((s: IStudent) => {
                  return (
                    <Col span={4} key={s.id}>
                      {this.renderStudentCard(s)}
                    </Col>
                  );
                })}
              </Row>
            );
          })}
        </div>
      );
    } else {
      return (
        <div>
          <Empty description="无学生" />
        </div>
      );
    }
  };

  openAllPolicy = async () => {
    const { data, currentClass } = this.state;
    if (!data || !currentClass || get(currentClass, 'students.length', 0) === 0) {
      return message.error("没有学生");
    }
    try {
      if (!getUrlSearch("code")) {
        return message.error("缺少学校代码")
      }
      let c = cloneDeep(currentClass.students);
      c.forEach(s => s.policy = true)

      await Auth.updateStudentsAuth({
        schoolCode: getUrlSearch("code") as string,
        students: c
      })
      data.forEach(c => {
        if (c.classId === currentClass.classId) {
          c.students.forEach(s => {
            s.policy = true;
          });
        }
      });
      this.setState({
        data
      });
    } catch (e) {
      return message.error(e.message);
    }
  };

  renderContent = () => {
    const { data } = this.state;
    if (!data) {
      return <Spin spinning={true}>正在加载...</Spin>;
    }
    return (
      <div>
        <div className="clearfix">
          {this.renderGradeSelect()}
          <Button className="fr" type="primary" onClick={this.openAllPolicy}>
            全部开放
          </Button>
        </div>
        {this.renderStudentCards()}
      </div>
    );
  };

  renderListItem = (item: any) => {
    let state = '',
      color = 'primary';
    if (item) {
      if (item.state === 0) {
        state = '排队中';
      } else if (item.state === 1) {
        state = '正在转码';
      } else if (item.state === 2) {
        state = '转码完成';
        color = 'success';
      } else if (item.state === 3) {
        state = '转码失败';
        color = 'error';
      }
    }
    return (
      <Item actions={[
        <span
          className='primary'
          onClick={() => this.handleClickDelBtn(item)}>
          删除
        </span>
      ]}>
        <Meta
          avatar={<Icon style={{ fontSize: 40 }} type="file-ppt" theme="twoTone" />}
          title={item.filename}
          description={
            <span>
              上传时间：{item.createtimestamp}
              <label
                className={color}
                style={{ marginLeft: 20 }}
              >
                {state}
              </label>
            </span>
          }
        />
      </Item>
    )
  }

  renderList = () => {
    const { listData, currentPage } = this.state;
    const pagination: any = {
      total: listData && listData.length,
      pageSize: 12,
      current: currentPage,
      onChange: (currentPage: any) => this.setState({ currentPage })
    }
    return (
      <List
        size="large"
        pagination={listData && listData.length > 0 && pagination}
        dataSource={listData}
        renderItem={this.renderListItem}
      />
    )
  }

  handleClickDelBtn = (item: any) => {
    Modal.confirm({
      title: '您确定要删除PPT吗？',
      mask: false,
      okText: "确认",
      cancelText: "取消",
      onOk: () => this.handleDeletePPT(item)
    })
  }

  handleDeletePPT = (item: any) => {
    CoursewareApi.deletePPT({
      name: item.name,
      state: item.state
    })
      .then(() => {
        message.success('删除成功');
        this.getAllPPT();
      })
      .catch((err: Error) => {
        message.error(err.message);
      })
  }

  getAllPPT = async () => {
    let res = await CoursewareApi.getallPPT();
    if (res) {
      this.setState({
        listData: reverse(res)
      })
    }
  }

  async componentDidMount() {
    try {
      if (getUrlSearch("key") === "courseware") {
        if (!getUrlSearch("code") || !getUrlSearch("token")) {
          this.setState({
            listData: [],
            currentPage: 1
          })
          return;
        }
        this.getAllPPT();
      } else {
        if (!getUrlSearch("code") || !getUrlSearch("token")) {
          this.setState({
            data: []
          })
          return;
        }
        let res = await Auth.getStudentsAuth();
        if (res) {
          this.setState({
            data: res,
            currentClass: res[0]
          });
        }
      }
    } catch (e) {
      message.error(e.message);
    }
  }

  handleUpload = (e: any) => {
    e.persist();
    const uuid: string = uuidv1().replace(/-/g, '');
    const file = e.nativeEvent.target.files[0] as File;
    this.setState({ inputKey: uuid });
    if (!file) {
      return;
    }
    try {
      let filename = file.name;
      let filetype = "";
      if (endsWith(filename, '.pptx')) {
        filetype = '.pptx';
      } else if (endsWith(filename, '.ppt')) {
        filetype = '.ppt';
      } else {
        throw new Error('请上传ppt或pptx格式的文件！')
      }
      filename = filename.slice(0, filename.lastIndexOf('.ppt'));
      const data = { uuid, filetype, file }
      CoursewareApi.uploadPPT(data)
        .then(() => {
          CoursewareApi.addPPT({
            filename,
            filetype,
            realname: uuid,
          }).then((res: any) => {
            if (res && res.coursewareid) {
              message.success('上传文件成功');
              this.getAllPPT();
              this.setState({ inputKey: '' })
            }
          }).catch((err: Error) => {
            console.log(err.message)
            throw new Error(err.message);
          })
        })
        .catch((err: Error) => {
          throw new Error(err.message);
        })
    } catch (err) {
      this.setState({ inputKey: '' })
      message.error(err.message);
    }
  }

  render() {
    const { inputKey } = this.state;
    if (getUrlSearch("key") === "courseware") {
      return (
        <div className="App">
          <h1>
            我的PPT
            <span className="tips">
              ( 上传PPT资源，转码完成后，在中育云笔记中您的账号下使用 )
            </span>
            <span style={{ float: 'right' }}>
              <input
                ref={(node: any) => this.uploadInput = node}
                key={inputKey}
                accept="application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={this.handleUpload}
                type="file"
                style={{ display: 'none' }}
              />
              <Button type="primary" loading={inputKey ? true : false} onClick={() => this.uploadInput.click()}>上传PPT</Button>
            </span>
          </h1>
          <Divider type="horizontal" />
          {this.renderList()}
        </div>
      )
    }
    return (
      <div className="App">
        <h1>
          学生权限管理
          <span className="tips">
            ( 蓝色表示开启权限，开启权限后学生可以使用笔记中的拍摄和图库功能 )
          </span>
        </h1>
        <Divider type="horizontal" />
        {this.renderContent()}
      </div>
    );
  }
}

export default App;
