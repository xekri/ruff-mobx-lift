import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { DirectionTypes } from '../Constants'

const { UP } = DirectionTypes
@observer
class FloorView extends Component {
  componentDidMount () {
    this.props.store.liftState.direct(UP)
  }
  render () {
    const {
      diplayedFloorState: {
        floorState, floor, press, reset
      },
      liftState: {
        goNextFloor, goDirection
      },
      floorsToStop
    } = this.props.store
    const renderBtn = () => {
      return Object.keys(floorState).map(d => {
        return (
          <label htmlFor={d} key={d}>
            <style jsx>{`
              label {
                display: block;
              }
              input {
                display: none;
              }
              span {
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                width: 30px;
                height: 30px;
                border: 2px solid #666666;
                color: #666666;
                border-radius: 100%;
                margin: 10px 0;
                background: #f3f3f3;
              }
              input:checked + span {
                color: rgb(13%, 50%, 63%);
                border-color: rgb(8%, 64%, 59%);
              }
            `}</style>
            <input
              type='checkbox'
              id={d}
              onClick={() => {
                if (floorState[d]) {
                  return
                }
                press(d)
              }}
              checked={floorState[d]}
              readOnly
            />
            <span>{d === UP ? (floorState[d] ? '▲' : '△') : (floorState[d] ? '▼' : '▽')}</span>
          </label>
        )
      })
    }
    return (
      <div className='floor-view'>
        <style jsx>{`
          .floor-view {
            width: 40vw;
            text-align: center;
            align-items: center;
            display: flex;
            justify-content: space-between;
            flex-direction: column;
          }
          h2, h4 {
            margin: 0;
          }
          button {
            height: 20px;
            width: 30px;
            font-size: 14px;
            vertical-align: middle;
          }
          button[type=reset] {
            font-size: 13px;
          }
          i {
            font-style: normal;
            font-size: 20px;
            font-weight: bold;
          }
        `}</style>
        <h2>F{floor}</h2>
        <section>
          {renderBtn()}
        </section>
        <section>
          <h4>Next Stop On:</h4>
          <span>{floorsToStop.join(' | ')}</span>
          <h4>Current Direction:</h4>
          <i>{goDirection === UP ? '⇑' : '⇓'}</i>
        </section>
        <section>
          <button onClick={goNextFloor}> ⇥ </button>
          <button type='reset' onClick={reset}> ↻ </button>
        </section>
      </div>
    )
  }
}
export default FloorView