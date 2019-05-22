const {ccclass, property} = cc._decorator;

@ccclass
export default class ColPrefab extends cc.Component {

    // 赌博图标
    @property({
        type: cc.SpriteFrame,
    })
    gameIcons: Array<cc.SpriteFrame> = []

    // 图标包裹
    @property({
        type: cc.Node
    })
    gameIconsWrap: cc.Node = null


    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        console.log(`col prefab onload`)
    }

    start () {
        console.log(`col prefab start`)
        let posY = -178
        this.gameIcons.forEach((item, index) => {
            this._fillCol(item, posY * Number(index))
            console.log(item, index)
        })
        // this.gameIconsWrap.addChild()
    }

    // update (dt) {}

    // 填充列容器
    _fillCol(spriteFrame: cc.SpriteFrame, posY: number):void {
        const iconNode = new cc.Node('iconNode')
        const sp = iconNode.addComponent(cc.Sprite)
        iconNode.y = -posY
        sp.spriteFrame = spriteFrame
        this.gameIconsWrap.addChild(iconNode)
    }
}
