/** Routes for Lunchly */

import express from "express";

import { BadRequestError } from "./expressError.js";
import Customer from "./models/customer.js";
import Reservation from "./models/reservation.js";

const router = new express.Router();

/** Homepage: show list of customers. */

router.get("/", async function (req, res, next) {

  let title;

  if (!req.query.search) {
    title = "Customers";
    const customers = await Customer.all();
    return res.render("customer_list.jinja", { customers, title });

  } else {
    title = "Search Result";
    const searchPhrase = req.query.search;
    const searchKeys = searchPhrase.split(" ");
    console.log("SEARCHHHHH", searchPhrase, searchKeys);

    const customers = await Customer.search(searchKeys);

    return res.render("customer_list.jinja", { customers, title });
  }
});

/** Form to add a new customer. */

router.get("/add/", async function (req, res, next) {
  return res.render("customer_new_form.jinja");
});

/** Handle adding a new customer. */

router.post("/add/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const { firstName, lastName, phone, notes } = req.body;
  const customer = new Customer({ firstName, lastName, phone, notes });
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Get the top-ten customers by number of reservations */

router.get("/top-ten/", async function (req, res) {
  const title = "Top-Ten Customers";

  const customers = await Customer.getTopTen();

  return res.render("customer_list.jinja", { customers, title });

});

/** Show a customer, given their ID. */

router.get("/:id/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);

  const reservations = await customer.getReservations();

  return res.render("customer_detail.jinja", { customer, reservations });
});

/** Show form to edit a customer. */

router.get("/:id/edit/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);

  res.render("customer_edit_form.jinja", { customer });
});

/** Handle editing a customer. */

router.post("/:id/edit/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const customer = await Customer.get(req.params.id);
  customer.firstName = req.body.firstName;
  customer.lastName = req.body.lastName;
  customer.phone = req.body.phone;
  customer.notes = req.body.notes;
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const customerId = req.params.id;
  const startAt = new Date(req.body.startAt);
  const numGuests = req.body.numGuests;
  const notes = req.body.notes;

  const reservation = new Reservation({
    customerId,
    startAt,
    numGuests,
    notes,
  });
  await reservation.save();

  return res.redirect(`/${customerId}/`);
});

export default router;