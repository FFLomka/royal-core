import Utils from "./Utils.js"

import("./typedef.js")

export default class Core {
	constructor(connector) {
		if (!connector) throw new TypeError("Connector is undefined")

		/**
		 * @private
		 */
		this._connector = connector
		/**
		 * @private
		 */
		this._sync = this._connector.constructor.name == "SyncConnector"
	}

	/**
	 * @private
	 */
	_getRules4Guideline(id, findGuideline = []) {
		try {
			if (findGuideline.includes(id)) return []
			findGuideline.push(id)

			if (this._sync) {
				const guideline = this._connectorFunc("get", id)
				return Utils.rulesCompact([
					...(guideline?.guidelines || []).map((r) => this._getRules4Guideline(r, findGuideline)).flat(),
					...(guideline?.rules || []),
				])
			}
			return new Promise(async (res, rej) => {
				const guideline = await this._connectorFunc("get", id)
				const rules = await Promise.all((guideline?.guidelines || []).map(async (r) => await this._getRules4Guideline(r, findGuideline)))
				res(Utils.rulesCompact([...rules.flat(), ...(guideline?.rules || [])]))
			})
		} catch (error) {
			return []
		}
	}

	/** public */

	/**
	 *
	 * @param {string} id Id Guideline
	 * @param {string|Rule} rule
	 * @returns {boolean}
	 */
	canGuideline(id, rule) {
		if (this._sync) {
			return Utils.canRules(this._getRules4Guideline(id), rule)
		}
		return new Promise(async (res, rej) => {
			res(Utils.canRules(await this._getRules4Guideline(id), rule))
		})
	}

	/**
	 *
	 * @param {string} id
	 * @param {GuidelineWithoutId} data
	 * @returns
	 */
	addGuideline(id, data = {}) {
		if (!id) throw new Error("id is empty")
		const {guidelines, payload, rules, upGuideline} = data
		return this._connectorFunc(
			"add",
			id,
			guidelines || [],
			payload,
			(rules || []).map((e) => Utils.string2Rule(e)),
			upGuideline || []
		)
	}
	/**
	 *
	 * @param {string} id Id Guideline
	 * @param {string|Rule} rule
	 * @returns {boolean}
	 */
	getGuidelineRules(id) {
		return this._getRules4Guideline(id)
	}

	/**
	 *
	 * @returns {Guideline[]}
	 */
	getGuidelines() {
		return this._connectorFunc("getAll")
	}

	/**
	 *
	 * @param {string} id
	 * @returns {Guideline}
	 */
	getGuideline(id) {
		return this._connectorFunc("get", id)
	}

	/**
	 *
	 * @param {string} id
	 * @returns
	 */
	removeGuideline(id) {
		return this._connectorFunc("remove", id)
	}

	/**
	 *
	 * @param {string} id
	 * @param {Object} controller
	 * @param {string[]} [controller.addRules]
	 * @param {string[]} [controller.removeRules]
	 * @param {string[]} [controller.addGuidelines]
	 * @param {string[]} [controller.removeGuidelines]
	 * @param {string[]} [controller.addUpGuidelines]
	 * @param {string[]} [controller.removeUpGuidelines]
	 * @param {any} [controller.payload]
	 * @returns
	 */
	updateGuideline(id, controller) {
		return this._connectorFunc("update", id, controller)
	}

	/**
	 * @private
	 * @param {*} func
	 * @param  {...any} args
	 * @returns
	 */
	_connectorFunc(func, ...args) {
		try {
			if (this._sync) {
				return this._connector[func](...args)
			}
			return new Promise(async (res, rej) => {
				try {
					res(await this._connector[func](...args))
				} catch (error) {
					rej(error)
				}
			})
		} catch (error) {
			throw error
		}
	}
}
