import { store } from '../store/store'
import { observer, render, reactor, react } from "../store/observer";

const {ccclass, property} = cc._decorator;

@ccclass
@observer
export default class GameScene extends cc.Component {

    // 老虎机列
    @property({
        type: cc.Prefab
    })
    colPrefab: cc.Prefab = null

    // 列包裹
    @property({
        type: cc.Node
    })
    gameWrap: cc.Node = null

    // colarray
    colArray: Array<cc.Node> = []

    // 转盘初始速度
    primarySpeed: Array<number> = [0, 0, 0]

    // 转盘减速度
    decreaseSpeed: number = 300

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        console.log(`game scence onload`)
    }

    start () {
        console.log(`game scence start`)
        for(let index=0; index <=6; index++){
            this.colArray.push(cc.instantiate(this.colPrefab))
        }
        this.colArray.forEach((item, index) => {
            this.gameWrap.addChild(item)
        })
        this._offsetInit()
    }

    /**
     * 帧数更新生命周期
     * @param dt 距离上一次update 时间间隔
     */
    update (dt: any) {
        // console.log(`game scence update ${dt}`)
        this.colArray.forEach((item, index) => {
            const tmpOffset = (this.primarySpeed[Math.floor(index/2)])*dt
            if(tmpOffset <= 0) {
                return true
            }

                item.y -= tmpOffset
                if(item.y < - item.height * 3/2) {
                    if(Number(index) % 2 === 1){
                        item.y = this.colArray[index - 1].y + item.height
                    } else {
                        item.y = this.colArray[index + 1].y + item.height
                    }
                }

            // 减速度
            if(Math.floor(index/2) === 0 || this.primarySpeed[Math.floor(index/2) - 1] <= 0){
                this.primarySpeed[Math.floor(index/2)] -= this.decreaseSpeed*dt
            }

        })
    }

    /**
     * 开始抽奖
     */
    spinClick(){
        this._offsetInit()

        this.primarySpeed = [3000, 3000, 3000]
    }

    _offsetInit() {
        this.colArray.forEach((item, index) => {
            item.x = 220 *(Math.floor(index/2) - 1)
            if(Number(index) % 2 === 1){
                item.y = - item.height
            } else {
                item.y = 0
            }
        })
    }
}
