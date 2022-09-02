import("./typedef.js")

export default class RoyalUtils {
	/**
	 *
	 * @param {string} idUser Id user
	 * @param {string|Rule} rule
	 * @returns {boolean}
	 */
	static canRules(rules, rule) {
		if (typeof rule == "string") {
			rule = this.string2Rule(rule)
		}
		if (!rule._v0) throw "Error rule"
		return this._canRules(rules, rule)
	}

	/**
	 *
	 * @param {Rule} rule
	 * @returns {string[]}
	 */
	static vKeys(rule) {
		return Object.keys(rule).filter((f) => f.startsWith("_v"))
	}

	/**
	 *
	 * @param {string} string
	 * @returns {Rule}
	 */
	static string2Rule(string) {
		const exception = string.startsWith("-")
		return {
			...Object.fromEntries(
				string
					.slice(+exception)
					.split(".")
					.map((e, i) => ["_v" + i, e])
			),
			exception,
		}
	}

	/**
	 *
	 * @param {Rule} rule
	 * @returns {string}
	 */
	static Rule2string(rule) {
		return (
			(rule.exception ? "-" : "") +
			Object.entries(rule)
				.filter((f) => f[0].startsWith("_v"))
				.map((e) => e[1])
				.join(".")
		)
	}

	/**
	 *
	 * @param {Rule[]} rules
	 * @returns {Rule[]}
	 */
	static rulesCompact(rules) {
		let result = [...rules]
		const d = result.map((e) => JSON.stringify(e))

		result = result.map((e, i) => (d.indexOf(JSON.stringify(e)) == i ? e : false)).filter((f) => !!f)
		result = result.map((e) => {
			const _vKeys = [...this.vKeys(e)]
			const _vKey = [..._vKeys].pop()
			if (e[_vKey] != "*") e["_v" + _vKeys.length] = "*"
			return e
		})

		result
			.filter((f) => {
				const _vKeys = this.vKeys(f)
				return f[_vKeys[_vKeys.length - 1]] === "*"
			})
			.map((e) => {
				const _vKeys = this.vKeys(e)
				result = result.filter(
					(f) =>
						_vKeys.map((_v, i, a) => (i == a.length - 1 ? f[_v] != "*" : f[_v] == e[_v])).filter((f) => !!f).length != _vKeys.length || f.exception
				)
			})

		return result
	}

	/**
	 *
	 * @private
	 * @param {Rule[]} rules
	 * @param {Rule} rule
	 * @returns
	 */
	static _canRules(rules, rule) {
		try {
			if (rules.find((f) => f._v0 === "*")) return true
			const _vKeys = this.vKeys(rule)
			if (
				rules
					.filter((f) => f.exception)
					.map(
						(e) =>
							_vKeys.map((_v) => e[_v] == "*" || e[_v] == undefined || rule[_v] == e[_v]).filter((f) => !!f).length == _vKeys.length &&
							_vKeys.length >= this.vKeys(e).length - 1
					)
					.filter((f) => !!f).length > 0
			)
				return false
			return (
				rules
					.filter((f) => !f.exception)
					.map((e) => _vKeys.map((_v) => e[_v] == "*" || e[_v] == undefined || rule[_v] == e[_v]).filter((f) => !!f).length == _vKeys.length)
					.filter((f) => !!f).length > 0
			)
		} catch (error) {
			console.error(error)
			return false
		}
	}
}
