import("./typedef.js")

export default class Core {
	constructor(connector, root = "Owner") {
		/**
		 * @private
		 */
		this._roles = root
			? [
					{
						id: "_root",
						name: root,
						rules: [
							{
								_v0: "*",
							},
						],
					},
			  ]
			: []
		/**
		 * @private
		 */
		this._users = []

		/**
		 * @private
		 */
		if (connector) {
			this._connector = connector
			this._initConnector()
		}
	}

	/**
	 * @private
	 */
	_initConnector() {
		try {
			if (!this._connector) return
			if (this._connector.constructor.name == "SyncConnector") {
				const rules = this._connector?.getData()
				rules.map((rule) => {
					try {
						if (rule.type == "role") {
							const {id, name, rules, roles, upRole} = rule.payload
							this._createRole(id, name, rules, roles, upRole, false)
						} else if (rule.type == "user") {
							const {id, rules, roles, upRole} = rule.payload
							this._createUser(id, roles, rules, upRole, false)
						}
					} catch (error) {}
				})
			} else {
				this._connector?.getData().then((rules) => {
					rules.map((rule) => {
						try {
							if (rule.type == "role") {
								const {id, name, rules, roles, upRole} = rule.payload
								this._createRole(id, name, rules, roles, upRole, false)
							} else if (rule.type == "user") {
								const {id, rules, roles, upRole} = rule.payload
								this._createUser(id, roles, rules, upRole, false)
							}
						} catch (error) {}
					})
				})
			}
		} catch (error) {}
	}

	/**
	 * @private
	 */
	async _addRoleConnector(role) {
		try {
			this._connector?.addRole(role)
		} catch (error) {}
	}

	/**
	 * @private
	 */
	async _addUserConnector(user) {
		try {
			this._connector?.addUser(user)
		} catch (error) {}
	}

	/**
	 * @private
	 */
	async _editRoleConnector(role) {
		try {
			this._connector?.editRole(role)
		} catch (error) {}
	}

	/**
	 * @private
	 */
	async _editUserConnector(user) {
		try {
			this._connector?.editUser(user)
		} catch (error) {}
	}

	/**
	 * @private
	 */
	async _removeRoleConnector(idRole) {
		try {
			this._connector?.removeRole(idRole)
		} catch (error) {}
	}

	/**
	 * @private
	 */
	async _removeUserConnector(idUser) {
		try {
			this._connector?.removeUser(idUser)
		} catch (error) {}
	}

	/**
	 * @private
	 * @param {string} id Uniq Id
	 * @param {string} name Name for role
	 * @param {Rule[]} rules Base rules
	 * @param {string[]} [role] More roles
	 * @param {string[]} [upRole] List roles is can control this Role
	 */
	_createRole(id, name, rules, roles, upRole, connector = true) {
		const r = {
			id,
			roles,
			name,
			rules,
			upRole,
		}
		this._deleteRole(id, false)
		this._roles.push(r)
		if (connector) this._addRoleConnector(r)
	}

	/**
	 * @private
	 * @param {string} id Uniq Id
	 * @param {string} name Name for role
	 * @param {Rule[]} rules Base rules
	 * @param {string[]} [role] More roles
	 * @param {string[]} [upRole] List roles is can control this Role
	 */
	_editRole(id, name, rules, roles, upRole, connector = true) {
		const r = {
			...this._getRole(id),
			...{
				id,
				roles,
				name,
				rules,
				upRole,
			},
		}
		this._deleteRole(id, false)
		this._roles.push(r)
		if (connector) this._editRoleConnector(r)
	}

	/**
	 *
	 * @private
	 * @param {string} idUser Id for search in roles
	 * @returns {Role}
	 * @throws {string} "User not find"
	 */
	_getRole(idRole) {
		const r = this._roles.find((f) => f.id === idRole)
		if (r) return r
		throw "Role not find"
	}

	/**
	 * @private
	 * @param {string} idRole Id for search in roles
	 */
	_deleteRole(idRole, connector = true) {
		this._roles = this._roles.filter((f) => f.id != idRole)
		if (connector) this._removeRoleConnector(idRole)
	}

	/**
	 * @private
	 * @param {string} id Uniq Id
	 * @param {string[]} [role] Base roles
	 * @param {Rule[]} rules More rules
	 * @param {string[]} [upRole] List roles is can control this user
	 */
	_createUser(id, roles, rules, upRole, connector = true) {
		const u = {
			id,
			roles,
			rules,
			upRole,
		}
		this._deleteUser(id, false)
		this._users.push(u)
		if (connector) this._addUserConnector(u)
	}

	/**
	 * @private
	 * @param {string} id Uniq Id
	 * @param {string[]} [role] Base roles
	 * @param {Rule[]} rules More rules
	 * @param {string[]} [upRole] List roles is can control this user
	 */
	_editUser(id, roles, rules, upRole, connector = true) {
		const u = {
			...this._getUser(id),
			...{
				id,
				roles,
				rules,
				upRole,
			},
		}
		this._deleteUser(id, false)
		this._users.push(u)
		if (connector) this._editUserConnector(u)
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
	 * @private
	 * @param {string} idUser Id for search in users
	 */
	_deleteUser(idUser, connector = true) {
		this._users = this._users.filter((f) => f.id != idUser)
		if (connector) this._removeUserConnector(idUser)
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
	_canUser(idUser, rule, raw) {
		try {
			const rules = raw ? idUser : this._getFullRules4User(idUser)
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

	/** public */

	/**
	 *
	 * @param {string} id
	 * @param {object} data
	 * @param {(string|Rule)[]} [data.rules]
	 * @param {string[]} [data.roles]
	 * @param {string[]} [data.upRole]
	 */
	addUser(id, data) {
		const {rules, roles, upRole} = data
		this._createUser(id, roles, rules?.map((e) => (typeof e == "string" ? this._string2Rule(e) : e)) || [], upRole)
	}

	/**
	 *
	 * @param {string} id
	 * @param {object} data
	 * @param {(string|Rule)[]} [data.rules]
	 * @param {string[]} [data.roles]
	 * @param {string[]} [data.upRole]
	 */
	editUser(id, data) {
		const {rules, roles, upRole} = data
		this._editUser(id, roles, rules?.map((e) => (typeof e == "string" ? this._string2Rule(e) : e)) || [], upRole)
	}

	/**
	 *
	 * @param {string} idUser
	 * @returns {User}
	 */
	getUser(idUser) {
		try {
			const user = this._getUser(idUser)

			return {
				...user,
				rules: user?.rules?.map((e) => this._Rule2string(e)) || [],
			}
		} catch (error) {}
	}

	/**
	 *
	 * @param {string} idUser
	 */
	deleteUser(idUser) {
		this._deleteUser(idUser)
	}

	/**
	 *
	 * @param {string} id
	 * @param {object} data
	 * @param {string} [data.name]
	 * @param {(string|Rule)[]} [data.rules]
	 * @param {string[]} [data.roles]
	 * @param {string[]} [data.upRole]
	 */
	addRole(id, data) {
		const {name, rules, roles, upRole} = data
		this._createRole(id, name, rules?.map((e) => (typeof e == "string" ? this._string2Rule(e) : e)) || [], roles, upRole)
	}

	/**
	 *
	 * @param {string} id
	 * @param {object} data
	 * @param {string} [data.name]
	 * @param {(string|Rule)[]} [data.rules]
	 * @param {string[]} [data.roles]
	 * @param {string[]} [data.upRole]
	 */
	editRole(id, data) {
		const {name, rules, roles, upRole} = data
		this._editRole(id, name, rules?.map((e) => (typeof e == "string" ? this._string2Rule(e) : e)) || [], roles, upRole)
	}

	/**
	 *
	 * @param {string} idRole
	 * @returns {Role}
	 */
	getRole(idRole) {
		try {
			const role = this._getRole(idRole)

			return {
				...role,
				rules: role?.rules?.map((e) => this._Rule2string(e)) || [],
			}
		} catch (error) {}
	}

	/**
	 *
	 * @param {string} idRole
	 */
	deleteRole(idRole) {
		this._deleteRole(idRole)
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
