import { report, Metrics, oldMetrics, setSiteId, setSpeId } from '@yy/hiidojs'
import { store } from '../store/store'
import { observer, render, reactor, react } from "../store/observer";
import CONFIG from '../config'
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

    // 当前赌币
    @property({
        type: cc.Node
    })
    betGlodWrap: cc.Node = null

    // 选择金额
    @property({
        type: cc.Node
    })
    selectWrap: cc.Node = null

    // colarray
    colArray: Array<cc.Node> = []

    // twocolarray 两col组成一列
    twoColArray: Array<any> = []

    // 转盘初始速度
    primarySpeed: Array<number> = [0, 0, 0]

    // 转盘减速度
    decreaseSpeed: number = 500

    // 调整速度
    adaptSpeed: number = 500


    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        console.log(`game scence onload`)
        console.log('hiido esm', report, Metrics, oldMetrics, setSiteId, setSpeId)
        Metrics.setOptions({ isOversea: true })
        Metrics.customReport({
        scode: '50264',
        ver: '1.0',
        uri: 'hello_world',
        topic: 'main_scene',
        val: Math.random() * 10
        })
    }

    start () {
        console.log(`game scence start`)
        this.twoColArray = [{
            state: 0, // 0 静止 1 滚动 2 调整
            adaptOffset: 0
        },
        {
            state: 0,
            adaptOffset: 0
        },
        {
            state: 0,
            adaptOffset: 0
        }]
        for(let index=0; index <=5; index++){
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
        this._colScroll(dt)
        this._adaptScroll(dt)
    }

    /**
     * 开始抽奖
     */
    spinClick(){
        const randomNumber = 4000 - Math.round(Math.random() * 1000)
        this._offsetInit()
        this.primarySpeed = [randomNumber, randomNumber, randomNumber]
        this.twoColArray = [
            {
                state: 1 // 0 静止 1 滚动 2 调整
            },
            {
                state: 1
            },
            {
                state: 1
            },
        ]
    }

    /**
     * 列滚动动画
     */
    _colScroll(dt: any): void {
        this.colArray.forEach((item, index) => {
            // console.log(Math.floor(index/2), this.twoColArray, this.colArray)
            if(this.twoColArray[Math.floor(index/2)].state != 1) {
                return true
            }
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
     * 调整滚动
     */
    _adaptScroll(dt: any):void {
        this.primarySpeed.forEach((item, index) => {
            if(item <= 0 && this.twoColArray[index].state === 1) {
                let offset = Number(this.colArray[index * 2].y) % CONFIG.unitHeight
                console.log('offset',index, offset, this.colArray[index * 2].y)
                if(offset !== 0){ // 需要卡位
                    if(Math.abs(offset) > CONFIG.unitHeight / 3) { // 需要减 达到卡位
                        this.twoColArray[index].adaptOffset = -(CONFIG.unitHeight - Math.abs(offset))
                        this.twoColArray[index].state = 2
                        if(offset > 0){
                            this.twoColArray[index].adaptOffset = (CONFIG.unitHeight - Math.abs(offset))
                        }else{
                            this.twoColArray[index].adaptOffset = -(CONFIG.unitHeight - Math.abs(offset))
                        }
                        console.log('offset up >', index, this.twoColArray[index].adaptOffset, this.colArray[index * 2].y)
                    } else { // 需要加达到卡位
                        this.twoColArray[index].state = 2
                        if(offset > 0){
                            this.twoColArray[index].adaptOffset = -Math.abs(offset)
                        }else{
                            this.twoColArray[index].adaptOffset = Math.abs(offset)
                        }
                        console.log('offset down >', index, this.twoColArray[index].adaptOffset, this.colArray[index * 2].y)
                    }
                }
            }
        })
        this.primarySpeed.forEach((item, index) => {
            if(item <= 0 && this.twoColArray[index].state === 2) {
                const offset = this.twoColArray[index].adaptOffset
                const adaptWay = dt * this.adaptSpeed
                const limitDistance = adaptWay * 6
                if(offset > 0) { // 需要减 达到卡位
                    if(Math.abs(offset) < limitDistance) {
                        this.colArray[index * 2].y -= offset
                        this.colArray[index * 2 + 1].y -= offset
                        this.twoColArray[index].state = 0
                        this.twoColArray[index].adaptOffset = 0
                    } else{
                        this.colArray[index * 2].y += adaptWay
                        this.colArray[index * 2 + 1].y += adaptWay
                        this.twoColArray[index].adaptOffset -= adaptWay
                    }
                } else { // 需要加达到卡位
                    if(Math.abs(offset) < limitDistance) {
                        this.colArray[index * 2].y += offset
                        this.colArray[index * 2 + 1].y += offset
                        this.twoColArray[index].state = 0
                        this.twoColArray[index].adaptOffset = 0
                    }else{
                        this.colArray[index * 2].y -= adaptWay
                        this.colArray[index * 2 + 1].y -= adaptWay
                        this.twoColArray[index].adaptOffset += adaptWay
                    }
                }
            }
        })
    }

    /**
     * 列初始偏移量设定
     */
    _offsetInit(): void {
        this.colArray.forEach((item, index) => {
            item.x = 220 *(Math.floor(index/2) - 1)
            if(Number(index) % 2 === 1){
                item.y = - item.height
            } else {
                item.y = 0
            }
        })
    }

    /**
     * 打印列数据
     */
    printColData(): void {
        console.log(this.colArray)
    }

    /**
     * 打开金额选择
     */
    openSelectWrap(): void {
        this.selectWrap.active = true
    }

    /**
     * 选择金额
     */
    selectGold(e: any, customeventdata: string): void {
        this.betGlodWrap.getComponent(cc.Label).string = customeventdata
        this.selectWrap.active = false
    }
}
