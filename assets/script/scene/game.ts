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

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        console.log(`game scence onload`)
    }

    start () {
        console.log(`game scence start`)
        this.gameWrap.addChild(cc.instantiate(this.colPrefab))
    }

    // update (dt) {}
}
