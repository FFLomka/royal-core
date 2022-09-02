import {Collection, MongoClient} from "mongodb"
import {Utils} from "../../index.js"

export default class MongoConnector {
	constructor(string, dbName, collection = "royal") {
		this._client = new MongoClient(string)
		this._connection = this._client.connect()
		this._dbName = dbName
		this._collection = collection

		this._getColl().then((coll) => {
			coll.createIndex(
				{
					id: 1,
				},
				{
					unique: true,
					name: "Guidelines Id",
				}
			)
		})
	}

	/**
	 * @private
	 * @returns {Promise<Collection>}
	 */
	async _getColl() {
		await this._connection
		return this._client.db(this._dbName).collection(this._collection)
	}

	async getAll() {
		return await (await this._getColl()).find().toArray()
	}

	async get(id) {
		return await (await this._getColl()).findOne({id})
	}

	async add(id, guidelines, payload, rules, upGuideline) {
		try {
			const doc = {
				id,
				guidelines,
				payload,
				rules,
				upGuideline,
			}

			await (await this._getColl()).insertOne(doc)

			return doc
		} catch (error) {
			throw new Error("Guideline is exists")
		}
	}

	async remove(id) {
		await (await this._getColl()).deleteOne({id})
		return
	}

	async update(id, controller) {
		const {addRules = [], removeRules = [], addGuidelines = [], removeGuidelines = [], addUpGuidelines = [], removeUpGuidelines = [], payload} = controller

		const coll = await this._getColl()

		await coll.updateOne(
			{id},
			{
				$pull: {rules: {$in: removeRules}, guidelines: {$in: removeGuidelines}, upGuideline: {$in: removeUpGuidelines}},
			}
		)

		await coll.updateOne(
			{id},
			{
				$push: {rules: {$each: addRules.map((e) => Utils.string2Rule(e))}, guidelines: {$each: addGuidelines}, upGuideline: {$each: addUpGuidelines}},
				...(payload ? {$set: {payload}} : {}),
			}
		)
	}
}
