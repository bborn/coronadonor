/*** IMPORTS ***/
// Module imports
import React, { Component } from "react"

// Local JS
import FormInput from "./FormInput"
import { getUrlPiece } from "../resources/Util"
/*** [end of imports] ***/

export default class Form extends Component {
	constructor(props) {
		super(props)

		this.state = {
			refreshes: 0,
			lastUrlSegment: getUrlPiece()
		}
	}

	render() {
		let {
			openMapPicker,
			lastClickedLat,
			lastClickedLon,
			scenarioId,
			userId
		} = this.props
		let { lastUrlSegment } = this.state

		return (
			<div className={`${lastUrlSegment}-form page-form`}>
				{this.pages[lastUrlSegment].inputs.map((_input, _index) => (
					<FormInput
						inputObj={_input}
						openMapPicker={openMapPicker}
						lat={lastClickedLat}
						lon={lastClickedLon}
						scenarioId={scenarioId || userId}
						key={_index}
					/>
				))}
			</div>
		)
	}
}
