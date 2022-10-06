import type {IRule} from "../royalCore"

export default class RoyalUtils {
	static canRules(rules: IRule[], rule: string | IRule): boolean {
		if (typeof rule == "string") {
			rule = this.string2Rule(rule)
		}
		if (!rule._v0) throw "Error rule"
		return this._canRules(rules, rule)
	}

	static vKeys(rule: IRule): string[] {
		return Object.keys(rule).filter((f) => f.startsWith("_v"))
	}

	static string2Rule(string: string): IRule {
		const exception = string.startsWith("-")
		return {
			_v0: "",
			...Object.fromEntries(
				string
					.slice(+exception)
					.split(".")
					.map((e, i) => ["_v" + i, e]),
			),
			exception,
		}
	}

	static Rule2string(rule: IRule): string {
		return (
			(rule.exception ? "-" : "") +
			Object.entries(rule)
				.filter((f) => f[0].startsWith("_v"))
				.map((e) => e[1])
				.join(".")
		)
	}

	static rulesCompact(rules: IRule[]): IRule[] {
		let result = [...rules]
		const d = result.map((e) => JSON.stringify(e))

		result = result.filter((f, i) => d.indexOf(JSON.stringify(f)) == i)
		result = result.map((e) => {
			const _vKeys = [...this.vKeys(e)]
			const _vKey = [..._vKeys].pop()
			if (_vKey && e[_vKey] !== "*") e["_v" + _vKeys.length] = "*"
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
						_vKeys.map((_v, i, a) => (i == a.length - 1 ? f[_v] != "*" : f[_v] == e[_v])).filter((f) => !!f).length != _vKeys.length || f.exception,
				)
			})

		return result
	}

	private static _canRules(rules: IRule[], rule: IRule): boolean {
		try {
			if (rules.find((f) => f._v0 === "*")) return true
			const _vKeys = this.vKeys(rule)
			if (
				rules
					.filter((f) => f.exception)
					.map(
						(e) =>
							_vKeys.map((_v) => e[_v] == "*" || e[_v] == undefined || rule[_v] == e[_v]).filter((f) => !!f).length == _vKeys.length &&
							_vKeys.length >= this.vKeys(e).length - 1,
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
