import { observable, action, intercept, runInAction } from 'mobx'
import {
  TOP_FLOOR,
  BOTTOM_FLOOR,
  FLOOR_CHANGE_TIME,
  DirectionTypes,
  DoorStates,
  DOOR_TOGGLE_TIME,
  DOOR_TIMEOUT
} from '../Constants'
import { timeout } from '../Utils'

class KeyModel {
  constructor (floor) {
    this.floor = floor
  }
  @observable isOn = false

  @action('In Car Floor Called') press = () => {
    this.isOn = true
  }
  @action('In Car Floor Call Canceled') cancel = () => {
    this.isOn = false
  }
  @action('In Car Floor Call Resolved') resolve = () => {
    this.isOn = false
  }
}

class LiftStore {
  constructor (id) {
    this.liftId = id
    for (let i = BOTTOM_FLOOR; i <= TOP_FLOOR; i++) {
      this.keypadState.push(new KeyModel(i))
    }
    intercept(this, 'currFloor', change => {
      if (change.newValue > TOP_FLOOR || change.newValue < BOTTOM_FLOOR) {
        throw new Error("Floor Exception: " + change.newValue)
      } else {
        return change
      }
    })
  }
  @observable keypadState = []
  @observable currFloor = 1
  @observable goDirection

  getKeyModel = (floor) => {
    return this.keypadState[floor - BOTTOM_FLOOR]
  }

  @action goNextFloor = async (isForce = false) => {
    switch (this.goDirection) {
      case DirectionTypes.UP: {
        if (!isForce) {
          await timeout(FLOOR_CHANGE_TIME)
        }
        runInAction('Lift Up a Floor', () => this.currFloor++)
        break
      }
      case DirectionTypes.DOWN: {
        if (!isForce) {
          await timeout(FLOOR_CHANGE_TIME)
        }
        runInAction('Lift Down a Floor', () => this.currFloor--)
        break
      }
      default: {
        throw new Error('No Direction. Can Cause Infinite loop')
      }
    }
  }
  @action direct (direction) {
    if (direction !== DirectionTypes.UP && direction !== DirectionTypes.DOWN) {
      throw new Error('Not a Valid Direction')
    }
    this.goDirection = direction
  }
  @action clearDirection () {
    this.goDirection = null
  }

  @observable doorState = DoorStates.CLOSED

  doorTimer
  @action openDoor = async () => {
    if (this.doorState === DoorStates.CLOSED) {
      this.doorState = DoorStates.OPENING
      await timeout(DOOR_TOGGLE_TIME)
      runInAction('Door Opened', () => {
        this.doorState = DoorStates.OPEN
      })
    }
    await timeout(DOOR_TIMEOUT, timer => {
      if (this.doorTimer) {
        clearTimeout(this.doorTimer)
      }
      this.doorTimer = timer
    })
    this.doorTimer = null
    this.closeDoor(true)
  }
  @action closeDoor = (isAuto = false) => {
    if (this.doorState === DoorStates.OPEN) {
      this.doorState = DoorStates.CLOSING
      if (this.doorTimer) {
        clearTimeout(this.doorTimer)
      }
      timeout(DOOR_TOGGLE_TIME).then(() => {
        runInAction(isAuto ? 'Door Auto Closed' : 'Door Closed', () => {
          this.doorState = DoorStates.CLOSED
        })
      })
    }
  }
}

export default LiftStore
