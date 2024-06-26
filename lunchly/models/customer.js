/** Customer for Lunchly */

import db from "../db.js";
import Reservation from "./reservation.js";

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           ORDER BY last_name, first_name`,
    );
    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           WHERE id = $1`,
      [id],
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** get an array of customers based on an array of string inputs. */

  //TODO: chat through the idea of combining with all()
  static async search(searchKeys) {

    const first_value = searchKeys[0];
    const second_value = searchKeys[1];

    if (searchKeys.length === 1) {
      const results = await db.query(
        `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           WHERE first_name LIKE $1
           OR last_name LIKE $1
           ORDER BY last_name, first_name`,
        [`${first_value}%`],
      );
      return results.rows.map(c => new Customer(c));
    } else {
      const results = await db.query(
        `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           WHERE first_name LIKE $1
           AND last_name LIKE $2
           ORDER BY last_name, first_name`,
        [`${first_value}%`, `${second_value}%`],
      );
      return results.rows.map(c => new Customer(c));
    }

  }

  /** Get the top-ten customers by number of reservations
   * Returns:
   * an array of customer instances
  */
  static async getTopTen() {
    const results = await db.query(
      `SELECT c.id,
              c.first_name AS "firstName",
              c.last_name  AS "lastName",
              c.phone,
              c.notes
       FROM customers as c
       JOIN reservations as r ON r.customer_id = c.id
       GROUP BY c.id
       ORDER BY COUNT(r.id) DESC, c.last_name, c.first_name
       LIMIT 10`
    );
    return results.rows.map(c => new Customer(c));
  }


  /** get the full name of the customer */

  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes],
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers
             SET first_name=$1,
                 last_name=$2,
                 phone=$3,
                 notes=$4
             WHERE id = $5`, [
        this.firstName,
        this.lastName,
        this.phone,
        this.notes,
        this.id,
      ],
      );
    }
  }
}

export default Customer;
