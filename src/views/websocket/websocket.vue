<template>
  <div style="display: flex;">
    <div class="sidebar-left">
      <div class="left-name" @click="ids=''">
        <img src="@/assets/images/1.jpeg">
        <div class="name">群聊</div>
        <div class="content">一群</div>
        <div class="time">08:31</div>
      </div>
      <div v-for="(item,index) in userList" v-show="item.nickname !== name" :key="index" class="left-name" @click="ids=item.id">
        <img src="@/assets/images/1.jpeg">
        <div class="name">{{ item.id }}---{{ item.nickname }}</div>
        <div class="content">测试热数据只为测试使用内容有限暂时这样</div>
        <div class="time">08:31</div>
      </div>
    </div>
    <div class="sidebar-right">
      <div class="top">
        <div v-for="(item,index) in contents" :key="index" :class="item.nickname != name?'ChatContent':'ChatContent-right'">{{ item.nickname }}:{{ item.message }}</div>
        <!-- <div class="ChatContent-right">{{names}}:{{message}}</div> -->
      </div>
      <div class="bottom">
        <div class="Label">1</div>
        <div ref="divcontent" class="InputPanel" contenteditable="true">1</div>
        <el-button type="primary" size="small" @click="sendMessage">发送</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import request from '@/utils/request'
export default {
  data() {
    return {
      MessageContent: '',
      content: '',
      ws: '',
      message: '',
      names: '',
      userList: [],
      ids: '',
      contents: [],
      time: 1000,
      Interval: null,
      Interval2: null
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  created() {
    this.info()
  },
  mounted() {
    window.addEventListener('beforeunload', this.beforeunloadFn)
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.beforeunloadFn)
  }, // 利用vue的生命周期函数
  methods: {
    info() {
      // console.log(this.name.split('').length)
      const name = this.name
      const id = this.name.split('').length
      const data = {
        id,
        name
      }
      request({
        url: 'webpack/info',
        method: 'post',
        data
      }).then(response => {
        this.ws = new WebSocket('ws://192.168.1.113:8090')
        this.init()
      }).catch(error => {
        this.$message.error(error)
      })
    },
    init() {
      // let ws = new WebSocket("ws://localhost:8090");
      this.ws.onopen = function(e) {
        console.log('Connection to server opened')
      }
      // 收到消息处理
      this.ws.onmessage = (e) => {
        var data = JSON.parse(e.data)
        if (data.message === '') {
          this.userList.push({ nickname: data.nickname, id: data.id })
          return
        }
        console.log(data)
        // var nickname = data.nickname
        this.appendLog(data.type, data.nickname, data.message, data)
        console.log('ID: [%s] = %s', data.id, data.message)
      }
      // let id = JSON.stringify(this.name.split('').length)
      this.ws.onclose = () => {
        console.log('连接已经断开请等待')
      }
      this.ws.error = (e) => {}
    },
    beforeunloadFn(e) {
      console.log('刷新或关闭')
      alert('刷新或关闭')
      const shuju = JSON.stringify({ content: '', id: this.name.split('').length })
      this.ws.send(shuju)
      // ...
    },
    appendLog(type, nickname, message, data) {
      if (type === 'list') {
        this.userList = JSON.parse(data.list)
        this.contents.push({ nickname, message })
        return
      }
      this.contents.push({ nickname, message })
    },
    // 发送消息
    sendMessage() {
      if (this.$refs.divcontent.innerHTML.replace(/\s/g, '') === '') {
        this.$message({
          message: '输入不能为空',
          type: 'warning'
        })
        return
      }
      let shuju
      if (this.ids !== '') {
        shuju = JSON.stringify({ content: this.$refs.divcontent.innerHTML, id: this.name.split('').length + '&' + this.ids, name: this.name })
      } else {
        shuju = JSON.stringify({ content: this.$refs.divcontent.innerHTML, name: this.name })
      }
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(shuju)
      }
      this.$refs.divcontent.innerHTML = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar-left{
  width: 15vw;
  height: calc(100vh - 90px);
  border-right: 1px #f8f8f8 solid;
  background: rgba(168, 223, 223, 0.349);
  .left-name{
    width: 100%;
    height: 50px;
    background: #a2cccc;
    box-sizing: border-box;
    border-top: 1px #ececec solid;
    position: relative;
    img{
      width: 30px;
      position: absolute;
      top: 8px;
      left: 10px;
    }
    .name{
      width: 90px;
      color: #a0ffff;
      font-size: 10px;
      position: absolute;
      top: 11px;
      left: 45px;
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
    }
    .content{
      width: 150px;
      color: #cbecff;
      font-size: 10px;
      position: absolute;
      top: 27px;
      left: 45px;
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
    }
    .time{
      color: #faffc8;
      font-size: 10px;
      position: absolute;
      top: 5px;
      right: 10px;
    }
  }
  .left-name:hover{
    cursor: pointer;
  }
  .left-name:nth-last-child(1){
    border-bottom: 1px #ececec solid;
  }
}
.sidebar-right{
  height: calc(100vh - 90px);
  background: rgba(139, 213, 255, 0.349);
  .top{
    width: 100%;
    height: 55vh;
    background: #fdfafa;
    .ChatContent-right{
      text-align: right;
    }
  }
  .bottom{
    width: 100%;
    height: 30vh;
    border-top: 1px rgb(204, 204, 204) solid;
    box-sizing: border-box;
    background: rgba(208, 253, 251, 0.021);
    position: relative;
    .Label{
      width: 100%;
      height: 35px;
      background: #fdfafa;
    }
    .InputPanel{
      width: 100%;
      height: calc(100% - 35px);
    }
    .el-button--primary{
      position: absolute;
      bottom: 10px;
      right: 30px;
    }
  }
}
.openSidebar .sidebar-right{
  width: calc(100vw - 15vw - 210px);
  transition: 0.5s;
}
.hideSidebar .sidebar-right{
  width: calc(100vw - 15vw - 54px);
  transition: 0.5s;
}
.mobile .sidebar-right{
  width: calc(100vw - 15vw);
  transition: 0.5s;
}
</style>
