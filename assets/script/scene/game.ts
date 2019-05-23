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
    primarySpeed: number = 1000

    // 转盘减速度
    decreaseSpeed: number =2

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        console.log(`game scence onload`)
    }

    start () {
        console.log(`game scence start`)
        for(let index=0; index <=6; index++){
            this.colArray.push(cc.instantiate(this.colPrefab))
        }
        console.log('colArray', this.colArray)
        this.colArray.forEach((item, index) => {
            item.x = 220 *(Math.floor(index/2) - 1)
            if(Number(index) % 2 === 1){
                item.y = item.height
            }
            this.gameWrap.addChild(item)
        })
        
    }

    update (dt) {
        // console.log(`game scence update ${dt}`)
        this.colArray.forEach((item) => {
            if(item.y < - item.height  - this.primarySpeed*dt) {
                item.y = item.height - this.primarySpeed*dt
            } else {
                item.y -= this.primarySpeed*dt
            }
            
        })
    }
}
