import {Collection, MongoClient, MongoServerSelectionError, ObjectId} from "mongodb"

export default class MongoConnector {
	constructor(string, dbName, collection = "royal") {
		this._client = new MongoClient(string)
		this._connection = this._client.connect()
		this._dbName = dbName
		this._collection = collection
	}

	/**
	 * @private
	 * @returns {Promise<Collection>}
	 */
	async _getColl() {
		await this._connection
		return this._client.db(this._dbName).collection(this._collection)
	}

	async getData() {
		const data = await (await this._getColl()).find().toArray()
		return data
			.map((e) => {
				if (e.type == "r") return {type: "role", payload: {...e, _id: e._id.toString()}}
				if (e.type == "u") return {type: "user", payload: {...e, _id: e._id.toString()}}
				return false
			})
			.filter((f) => !!f)
	}
	async addRole(role) {
		await (await this._getColl()).deleteMany({id: role.id, type: "r"})
		await (await this._getColl()).insertOne({...role, createdAt: new Date(), type: "r"})
	}
	async addUser(user) {
		await (await this._getColl()).deleteMany({id: user.id, type: "u"})
		await (await this._getColl()).insertOne({...user, createdAt: new Date(), type: "u"})
	}
	async removeRole(idRole) {
		await (await this._getColl()).deleteMany({id: idRole, type: "r"})
	}
	async removeUser(idUser) {
		await (await this._getColl()).deleteMany({id: idUser, type: "u"})
	}
}
