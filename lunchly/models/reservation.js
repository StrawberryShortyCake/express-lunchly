/** Reservation for Lunchly */

import * as datefns from "date-fns";
import db from "../db.js";

/** A reservation for a party */

class Reservation {
  constructor({ id, customerId, numGuests, startAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /**  */
  get numGuests() {
    return this._numGuests;
  }

  /**  */
  set numGuests(val) {
    if (val < 1) {
      throw new Error("Can't reserve for fewer than 1 person");
    }
    this._numGuests = val;
  }

  /** formatter for startAt */

  getFormattedStartAt() {
    datefns.format(this.startAt, "MMMM d yyyy, h:mm a");
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id,
                  customer_id AS "customerId",
                  num_guests AS "numGuests",
                  start_at AS "startAt",
                  notes AS "notes"
           FROM reservations
           WHERE customer_id = $1`,
      [customerId],
    );

    return results.rows.map(row => new Reservation(row));
  }


  /** save the reservation */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, start_at, num_guests, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.customerId, this.startAt, this.numGuests, this.notes],
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations
             SET customer_id=$1,
                 start_at=$2,
                 num_guests=$3,
                 notes=$4
             WHERE id = $5`, [
        this.customerId,
        this.startAt,
        this.numGuests,
        this.notes,
        this.id,
      ],
      );
    }
  }
}


export default Reservation;
