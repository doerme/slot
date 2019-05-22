import { observable, action } from 'mobx'

class Store {
    @observable
    public testNumber: number

    @action
    public testNumberAdd() {
        this.testNumber+=1
    }

    @action
    public init():void {
        this.testNumber = 0
    }

}

export const store = new Store