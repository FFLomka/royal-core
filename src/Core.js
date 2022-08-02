import("./typedef.js")

export default class Core {
	constructor() {
		/**
		 * @private
		 */
		this._roles = [
			{
				id: "_root",
				name: "Owner",
				rules: [
					{
						_v0: "*",
					},
				],
			},
		]
		/**
		 * @private
		 */
		this._users = []
	}

	/**
	 * @private
	 * @param {string} id Uniq Id
	 * @param {string} name Name for role
	 * @param {Rule[]} rules Base rules
	 * @param {string[]} [role] More roles
	 * @param {string[]} [upRole] List roles is can control this Role
	 */
	_createRole(id, name, rules, roles, upRole) {
		this._roles.push({
			id,
			roles,
			name,
			rules,
			upRole,
		})
	}

	/**
	 * @private
	 * @param {string} id Uniq Id
	 * @param {string[]} [role] Base roles
	 * @param {Rule[]} rules More rules
	 * @param {string[]} [upRole] List roles is can control this user
	 */
	_createUser(id, roles, rules, upRole) {
		this._users.push({
			id,
			roles,
			rules,
			upRole,
		})
	}

	/**
	 * @private
	 */
	_vKeys(rule) {
		return Object.keys(rule).filter((f) => f.startsWith("_v"))
	}

	/**
	 * @private
	 */
	_rulesCompact(rules) {
		let result = [...rules]
		const d = result.map((e) => JSON.stringify(e))

		result = result.map((e, i) => (d.indexOf(JSON.stringify(e)) == i ? e : false)).filter((f) => !!f)
		result = result.map((e) => {
			const _vKeys = [...this._vKeys(e)]
			const _vKey = [..._vKeys].pop()
			if (e[_vKey] != "*") e["_v" + _vKeys.length] = "*"
			return e
		})

		result
			.filter((f) => {
				const _vKeys = this._vKeys(f)
				return f[_vKeys[_vKeys.length - 1]] === "*"
			})
			.map((e) => {
				const _vKeys = this._vKeys(e)
				result = result.filter(
					(f) =>
						_vKeys.map((_v, i, a) => (i == a.length - 1 ? f[_v] != "*" : f[_v] == e[_v])).filter((f) => !!f).length != _vKeys.length || f.exception
				)
			})

		return result
	}

	/**
	 * @private
	 */
	_getRules4Role(idRole, findRole = []) {
		try {
			if (findRole.includes(idRole)) return []
			findRole.push(idRole)
			const role = this._getRole(idRole)
			return this._rulesCompact([...role.rules, ...(role?.roles || []).map((r) => this._getRules4Role(r, findRole)).flat()])
		} catch (error) {
			return []
		}
	}

	/**
	 * @private
	 */
	_getFullRules4User(idUser) {
		const user = this._getUser(idUser)
		return this._rulesCompact([...(user?.roles || []).map((r) => this._getRules4Role(r)).flat(), ...(user?.rules || [])])
	}

	/**
	 * @private
	 */
	_canUser(idUser, rule) {
		try {
			const rules = this._getFullRules4User(idUser)
			if (rules.find((f) => f._v0 === "*")) return true
			const _vKeys = this._vKeys(rule)
			if (
				rules
					.filter((f) => f.exception)
					.map(
						(e) =>
							_vKeys.map((_v) => e[_v] == "*" || e[_v] == undefined || rule[_v] == e[_v]).filter((f) => !!f).length == _vKeys.length &&
							_vKeys.length >= this._vKeys(e).length - 1
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

	/**
	 * @private
	 * @param {string} idUser Id for search in users
	 * @returns {User}
	 * @throws {string} "User not find"
	 */
	_getUser(idUser) {
		const u = this._users.find((f) => f.id === idUser)
		if (u) return u
		throw "User not find"
	}

	/**
	 *
	 * @private
	 * @param {string} idUser Id for search in users
	 * @returns {User}
	 * @throws {string} "User not find"
	 */
	_getRole(idRole) {
		const r = this._roles.find((f) => f.id === idRole)
		if (r) return r
		throw "Role not find"
	}

	/**
	 *
	 * @private
	 * @param {string} string
	 * @returns {Rule}
	 */
	_string2Rule(string) {
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
	 * @private
	 * @param {Rule} rule
	 * @returns {string}
	 */
	_Rule2string(rule) {
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
	 * @param {string} idUser Id user
	 * @param {string|Rule} rule
	 * @returns {boolean}
	 */
	canUser(idUser, rule) {
		if (typeof rule == "string") {
			rule = this._string2Rule(rule)
		}
		if (!rule._v0) throw "Error rule"
		return this._canUser(idUser, rule)
	}
}
