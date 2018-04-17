/*** IMPORTS ***/
// Module imports
import React, { Component } from "react"
import createHistory from "history/createBrowserHistory"
import Icon from "@fortawesome/react-fontawesome"

// Local JS
import Database from "../resources/Database"
import { getUrlPiece, toFirstCap } from "../resources/Util"
/*** [end of imports] ***/

const history = createHistory()

export default class Scenario extends Component {
  constructor(props) {
    super(props)

    this.state = {
      xTransform: 0,
      touchStartX: 0,
      lastTouchX: 0,
      style: { transform: "translateX(0)" },
      beforeStyle: { opacity: 0 },
      afterStyle: { opacity: 0 },
      swipeThreshold: 150,
      transitionTiming: 100,
      lastUrlSegment: getUrlPiece()
    }

    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleTouchMove = this.handleTouchMove.bind(this)
    this.handleTouchEnd = this.handleTouchEnd.bind(this)
  }

  componentDidMount = () => {
    if (this.props.feedReset) {
      this.setState({
        xTransform: 0,
        touchStartX: 0,
        lastTouchX: 0,
        style: { transform: `translateX(0)` },
        beforeStyle: { opacity: 0 },
        afterStyle: { opacity: 0 }
      })
    }
  }

  handleTouchStart = e => {
    this.setState({
      touchStartX: e.targetTouches[0].clientX,
      style: {
        transform: `translateX(0)`,
        zIndex: 10
      }
    })
  }
  handleTouchMove = e => {
    const { touchStartX } = this.state
    let currentTouchX = e.targetTouches[0].clientX
    let xDif = currentTouchX - touchStartX

    if (xDif > 0) {
      this.setState({
        xTransform: xDif,
        lastTouchX: currentTouchX,
        style: {
          transform: `translateX(${xDif}px)`
        },
        beforeStyle: {
          opacity: 1
        },
        afterStyle: {
          opacity: 0
        }
      })
    } else {
      this.setState({
        xTransform: xDif,
        lastTouchX: currentTouchX,
        style: {
          transform: `translateX(${xDif}px)`
        },
        beforeStyle: {
          opacity: 0
        },
        afterStyle: {
          opacity: 1
        }
      })
    }
  }
  handleTouchEnd = e => {
    const { touchStartX, lastTouchX, swipeThreshold } = this.state

    let xDif = lastTouchX === 0 ? 0 : lastTouchX - touchStartX

    if (Math.abs(xDif) > swipeThreshold) {
      if (touchStartX < lastTouchX) this.swipedRight()
      else this.swipedLeft()
    } else {
      this.resetSwipePos()
    }
  }

  swipedRight = () => {
    const { transitionTiming, lastUrlSegment } = this.state
    const { id } = this.props.scenario

    this.setState({
      style: {
        transform: "translateX(100%)",
        marginBottom: "-15rem" // Currently this is an approximation of the element height
      }
    })
    setTimeout(() => {
      this.acceptScenario({ scenarioId: id })
      history.push(`/${id}/${lastUrlSegment}/`)
      window.location = `/${id}/${lastUrlSegment}/`
    }, transitionTiming)
  }
  swipedLeft = () => {
    const { lastUrlSegment } = this.state
    const { id } = this.props.scenario

    let adType

    if (lastUrlSegment === "doer") adType = "1"
    else if (lastUrlSegment === "requester") adType = "2"
    else if (lastUrlSegment === "donator") adType = "3"
    else if (lastUrlSegment === "verifier") adType = "4"

    this.setState({
      style: {
        transform: "translateX(-100%)",
        marginBottom: "-15rem" // Currently this is an approximation of the element height
      }
    })
    this.dismissScenario({ scenarioId: id, adType: adType })
  }
  resetSwipePos = () => {
    this.setState({
      style: {
        transform: "translateX(0)",
        zIndex: 10
      },
      beforeStyle: { opacity: 0 },
      afterStyle: { opacity: 0 }
    })
  }

  dismissScenario = params => {
    let json = {
      data: {
        type: "user_ad_interactions",
        attributes: {},
        relationships: {
          user: {
            data: {
              type: "users",
              id: "1"
            }
          },
          scenario: {
            data: {
              id: params.scenarioId,
              type: "scenarios"
            }
          },
          ad_type: {
            data: {
              id: params.adType,
              type: "ad_types"
            }
          },
          interaction_type: {
            data: {
              id: "2",
              type: "interaction_types"
            }
          }
        }
      }
    }

    Database.createUserAdInteraction(json)
      .then(result => {
        // console.log("User ad interaction successfully created:", result)
        this.props.removeFromFeed()
      })
      .catch(error => {
        // console.error("Error creating user ad interaction:", error)
      })
  }
  acceptScenario = params => {
    const { lastUrlSegment } = this.state
    let ad_type

    if (lastUrlSegment === "doer") ad_type = "1"
    else if (lastUrlSegment === "requester") ad_type = "2"
    else if (lastUrlSegment === "donator") ad_type = "3"
    else if (lastUrlSegment === "verifier") ad_type = "4"

    let json = {
      data: {
        type: "user_ad_interactions",
        attributes: {},
        relationships: {
          user: {
            data: {
              type: "users",
              id: "1"
            }
          },
          scenario: {
            data: {
              id: params.scenarioId,
              type: "scenarios"
            }
          },
          ad_type: {
            data: {
              id: ad_type,
              type: "ad_types"
            }
          },
          interaction_type: {
            data: {
              id: "1",
              type: "interaction_types"
            }
          }
        }
      }
    }

    Database.createUserAdInteraction(json)
      .then(result => {
        // console.log("User ad interaction successfully created:", result)
      })
      .catch(error => {
        // console.error("Error creating user ad interaction:", error)
      })
  }

  titleBuild = () => {
    const {
      requester_firstname,
      donated,
      noun,
      verb
    } = this.props.scenario.attributes
    const { lastUrlSegment } = this.state

    if (lastUrlSegment === "donator") {
      return (
        <header className="scenario-header">
          <h4 className="scenario-title">
            {<span>{`Help us fund ${toFirstCap(requester_firstname)}`}</span>}
          </h4>
          <h5 className="scenario-subtitle">
            {<span>{`${donated} funded so far`}</span>}
          </h5>
        </header>
      )
    } else if (lastUrlSegment === "doer") {
      return (
        <header className="scenario-header">
          <h4 className="scenario-title">
            <span>{`Can you ${verb} ${noun} for ${toFirstCap(
              requester_firstname
            )}?`}</span>
          </h4>
          <h5 className="scenario-subtitle">
            <span>{`${donated} funded`}</span>
          </h5>
        </header>
      )
    } else if (lastUrlSegment === "requester") {
      return (
        <header className="scenario-header">
          <h4 className="scenario-title">
            <span>{`Need ${noun}?`}</span>
          </h4>
          <h5 className="scenario-subtitle">
            <span>30 individuals helped this month</span>
          </h5>
        </header>
      )
    } else if (lastUrlSegment === "verifier") {
      return (
        <header className="scenario-header">
          <h4 className="scenario-title">
            <span>{`Know ${toFirstCap(requester_firstname)}?`}</span>
          </h4>
          <h5 className="scenario-subtitle">
            <span>Help us identify them on Facebook</span>
          </h5>
        </header>
      )
    }
  }
  callToActionBuild = requestType => {
    if (requestType === "doer") return <span>Help today</span>
    else if (requestType === "donator") return <span>Donate now</span>
    else if (requestType === "verifier") return <span>Verify user</span>
    else if (requestType === "requester") return <span>Get Help</span>
  }

  render() {
    const { style, beforeStyle, afterStyle, lastUrlSegment } = this.state
    const { scenario } = this.props
    const { id } = scenario

    const {
      // doer_firstname,
      // doer_lastname,
      // requester_firstname,
      // requester_lastname,
      // funding_goal,
      disaster,
      // doerlat,
      // doerlon,
      // requestorlat,
      // requestorlon,
      // donated,
      image
      // imagethumb,
      // noun,
      // verb
    } = this.props.scenario.attributes

    return (
      <article
        className={`scenario ${lastUrlSegment}-scenario`}
        id={`scenario_${id}`}
        style={style}
        onTouchStart={e => this.handleTouchStart(e)}
        onTouchMove={e => this.handleTouchMove(e)}
        onTouchEnd={e => this.handleTouchEnd(e)}
      >
        <div className="pseudo-before" style={beforeStyle}>
          <p>Accept</p>
          <Icon icon="thumbs-up" />
        </div>
        <div className="pseudo-after" style={afterStyle}>
          <p>Dismiss</p>
          <Icon icon="ban" />
        </div>
        <figure className="scenario-image-wrap">
          <img src={image} alt={disaster} className="scenario-image" />
          <p className="scenario-image-caption">{disaster}</p>
        </figure>
        {this.titleBuild()}
        <a
          className="btn accept-scenario-btn"
          href={`/${id}/${lastUrlSegment}/`}
        >
          {this.callToActionBuild(lastUrlSegment)}
        </a>
      </article>
    )
  }
}
