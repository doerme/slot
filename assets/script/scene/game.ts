import { report, Metrics, oldMetrics, setSiteId, setSpeId } from '@yy/hiidojs'
import { store } from '../store/store'
import { observer, render, reactor, react } from "../store/observer";
import CONFIG from '../config'
import { transformFruit, transformFruitString } from '../helper/util'
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
    twoColArray: Array<any> = [{
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

    // 转盘初始速度
    primarySpeed: Array<number> = [0, 0, 0]

    // 转盘减速度 调整后 需要对应调整期望结果偏移量
    decreaseSpeed: number = 1000

    // 调整速度 调整后 需要对应调整期望结果偏移量
    adaptSpeed: number = 1000

    // 当前目标转到结果
    resultAim: Array<number>=[0,0,0]

    // 期望结果偏移量 必须为正数
    expectOffset: number = 4

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
        // let randomNumber = 4000 - Math.round(Math.random() * 1000)
        let randomNumber = 4000
        this.resultAim = [Math.floor(Math.random() * 7) ,Math.floor(Math.random() * 7), Math.floor(Math.random() * 7)]
        console.log(this.resultAim)
        this.resultAim.forEach((item: any, index: any) => {
            console.log(`期望结果`,index, CONFIG.colIconArray[item])
        })
        this._offsetInit()
        this.primarySpeed = [randomNumber, randomNumber, randomNumber]
        this.twoColArray = [
            {
                state: 1 // 0 静止 1 无限滚动 2减速滚动 3调整位置
            },
            {
                state: 1
            },
            {
                state: 1
            },
        ]
    }

    _bottomToTop(item: any, bother: any):void{
        if(item.y < - item.height * 3/2) {
            item.y = bother.y + item.height
        }
    }

    /**
     * 列滚动动画
     */
    _colScroll(dt: any): void {
        this.twoColArray.forEach((item, index) => {
            // console.log(Math.floor(index/2), this.twoColArray, this.colArray)
            if(item.state == 0 || item.state == 3) {
                // console.log(`end scroll for state`, index)
                return true
            }
            const tmpOffset = (this.primarySpeed[index])*dt
            if(tmpOffset <= 0) {
                console.log(`end scroll for offset`, index)
                return true
            }
            this.colArray[index * 2].y -= tmpOffset
            this.colArray[index * 2 + 1].y -= tmpOffset

            this._bottomToTop(this.colArray[index * 2], this.colArray[index * 2 + 1])
            this._bottomToTop(this.colArray[index * 2 + 1], this.colArray[index * 2])
            
            // 减速度 第一列直接减速  其他列等前一列减速小于0时候 再减速
            if(index === 0 || this.primarySpeed[index - 1] <= 0){
            // if(true) {
                if(this.primarySpeed[index] < this.decreaseSpeed*dt) {
                    this.primarySpeed[index] = 0
                } else if(this.twoColArray[index].state == 2){
                    // 根据结果开始减速
                    this.primarySpeed[index] -= this.decreaseSpeed*dt
                } else {
                    const yoffset = -this.resultAim[index]
                    const yduration = (yoffset - this.expectOffset) * 178
                    // console.log(`-----------`, yoffset, index * 2, this.colArray[index * 2].y)
                    if(this.colArray[index * 2].y > yduration && this.colArray[index * 2].y <= yduration + tmpOffset) {
                        this.twoColArray[index].state = 2
                        this._printGameEndResult(`begin expect >>>>>>>>>>`, yoffset, transformFruit(yoffset))
                    }
                    
                }
            }

        })
    }

    /**
     * 调整滚动
     */
    _adaptScroll(dt: any):void {
        this.primarySpeed.forEach((item, index) => {
            if(item <= 0 && this.twoColArray[index].state === 2) { // state 1 计算卡位位置
                this.twoColArray[index].state = 3
                let offset = Number(this.colArray[index * 2].y) % CONFIG.unitHeight
                console.log('offset',index, offset, this.colArray[index * 2].y, this.primarySpeed, this.twoColArray)
                if(offset !== 0){ // 需要卡位
                    if(Math.abs(offset) > CONFIG.unitHeight / 3) { // 需要减 达到卡位
                        this.twoColArray[index].adaptOffset = -(CONFIG.unitHeight - Math.abs(offset))
                        if(offset > 0){
                            this.twoColArray[index].adaptOffset = (CONFIG.unitHeight - Math.abs(offset))
                        }else{
                            this.twoColArray[index].adaptOffset = -(CONFIG.unitHeight - Math.abs(offset))
                        }
                    } else { // 需要加达到卡位
                        if(offset > 0){
                            this.twoColArray[index].adaptOffset = -Math.abs(offset)
                        }else{
                            this.twoColArray[index].adaptOffset = Math.abs(offset)
                        }
                    }
                }
            }
        })
        this.primarySpeed.forEach((item, index) => {
            if(item <= 0 && this.twoColArray[index].state === 3) { // state 2 卡位
                const offset = this.twoColArray[index].adaptOffset
                const adaptWay = dt * this.adaptSpeed
                const limitDistance = adaptWay * 1
                if(Math.abs(offset) < limitDistance) {
                    this.colArray[index * 2].y += offset
                    this.colArray[index * 2 + 1].y += offset
                    this.twoColArray[index].state = 0
                    this.twoColArray[index].adaptOffset = 0
                    this._printGameEndResult(`end scroll ${index}`,Math.floor(this.colArray[index * 2].y) / 178, transformFruit(Math.floor(this.colArray[index * 2].y) / 178))
                } else if(offset > 0) { // 需要减 达到卡位
                    this.colArray[index * 2].y += adaptWay
                    this.colArray[index * 2 + 1].y += adaptWay
                    this.twoColArray[index].adaptOffset -= adaptWay
                } else { // 需要加达到卡位
                    this.colArray[index * 2].y -= adaptWay
                    this.colArray[index * 2 + 1].y -= adaptWay
                    this.twoColArray[index].adaptOffset += adaptWay
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
     * 打印游戏结果
     */
    _printGameEndResult(pretab: string,colindex: number, resultIndex: number): void {
        console.log(pretab, `>> ${colindex} <<`, CONFIG.colIconArray[resultIndex], resultIndex)
        console.log(this.primarySpeed, this.twoColArray)
    }

    /**
     * 打印列数据
     */
    printColData(): void {
        // console.log(this.colArray)
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
