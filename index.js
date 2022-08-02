/**
 * @module royal-core
 */

import Core from "./src/Core.js"

export default Core

const royal = new Core()

royal._createRole("buyer", "Покупатель", [
	{
		_v0: "products",
		_v1: "buy",
	},
	{
		_v0: "settings",
		_v1: "user",
		_v2: "address",
	},
])
royal._createRole("superAdmin", "B.O.S.S.", [
	{
		_v0: "*",
	},
])
royal._createRole("YungHassle Shmot_owner", "YungHassle Shmot Владелец", [
	{
		_v0: "office",
		_v1: "YungHassle Shmot",
	},
])
royal._createRole("admin_moderator", "Модератор", [
	{
		_v0: "admin",
		_v1: "info_type",
		_v2: "moderator",
	},
])
royal._createRole(
	"admin_baner",
	"Редактор банера",
	[
		{
			_v0: "admin",
			_v1: "settings",
			_v2: "mainpage",
			_v3: "baner",
		},
	],
	["admin_moderator"]
)

royal._createRole("YungHassle Glasses_owner", "YungHassle Glasses Владелец", [
	{
		_v0: "office",
		_v1: "YungHassle Glasses",
	},
])

royal._createRole("YungHassle Glasses_manager", "YungHassle Glasses Манагер", [
	{
		_v0: "office",
		_v1: "YungHassle Glasses",
	},
])

royal._createUser(
	"flomka",
	["buyer", "YungHassle Glasses_manager"],
	[
		{
			exception: true,
			_v0: "office",
			_v1: "YungHassle Glasses",
			_v2: "employee",
			_v3: "new",
		},
	]
)
royal._createUser("yunghassle", ["buyer", "YungHassle Shmot_owner", "YungHassle Glasses_owner"], [])

royal._createUser("root", [], [{_v0: "*"}])
console.log("start")
console.time()
console.log(royal.canUser("flomka", "products.buy"))
console.log(royal.canUser("flomka", "office"))
console.log(royal.canUser("flomka", "office.YungHassle Glasses.employee.new"))
console.log(royal.canUser("yunghassle", "products.buy"))
console.log(royal.canUser("yunghassle", "office.YungHassle Shmot.settings"))
console.log(royal.canUser("yunghassle", "office.YungHassle Glasses.settings"))
console.log(royal.canUser("yunghassle", "office.YungHassle Box.settings"))
console.log(royal.canUser("yunghassle", "office"))
console.timeEnd()

/**

	'YungHassle Shmot'
	'YangHassle Glasses'

 */

function middlewareRoyal(rule) {
	return function (req, res, next) {
		if (!req?.user?._id) return next(401)
		if (!royal.canUser(req?.user?._id || "", rule)) return next(403)
		next()
	}
}
