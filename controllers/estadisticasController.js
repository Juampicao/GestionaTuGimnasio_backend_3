import Suscriptor from "../models/Suscriptor.js";
import Pagos from "../models/Pagos.js";

import { hoy } from "../helpers/funciones.js";
import TipoSuscripcion from "../models/TipoSuscripcion.js";

const getEstadisticasEstadosSuscriptores = async (req, res) => {
  const { id } = req.params;

  const suscriptoresActivos = await Suscriptor.find({
    $and: [{ creador: req.usuario }, { estado: "Activo" }],
  }).count();

  const suscriptoresDeudores = await Suscriptor.find({
    $and: [{ creador: req.usuario }, { estado: "Deudor" }],
  }).count();

  const suscriptoresTotales = await Suscriptor.find({
    $and: [{ creador: req.usuario }],
  }).count();

  const obtenerMontosTotalesPorMesPorCuota = await Pagos.aggregate([
    {
      $match: {
        $and: [{ creador: req.usuario._id }],
      },
    },
    {
      $group: {
        _id: {
          mes: { $month: "$pagoUnico.fechaPagoSuscripcion" },
        },
        montoPagoSuscripcion: { $sum: "$pagoUnico.montoPagoSuscripcion" },
      },
    },
  ]);

  const obtenerCantidadCuotasPagasPorMes = await Pagos.aggregate([
    {
      $match: {
        $and: [{ creador: req.usuario._id }],
      },
    },
    {
      $group: {
        _id: {
          mes: { $month: "$pagoUnico.fechaPagoSuscripcion" },
        },
        cantidadCuotas: { $sum: 1 },
      },
    },
  ]);

  const obtenerCantidadActivosTipoSuscripcion = await Suscriptor.aggregate([
    {
      $match: {
        $and: [{ creador: req.usuario._id }, { estado: "Activo" }],
      },
    },
    {
      $group: {
        _id: {
          tipoSuscripcion: "$tipoSuscripcion",
        },
        cantidadCuotas: { $sum: 1 },
      },
    },
    // {
    //   $lookup: {
    //     from: "TipoSuscripcion",
    //     localField: "tipoSuscripcion",
    //     foreignField: "_id",
    //     as: "nueva2",
    //   },
    // },
  ]);

  // let nuevoArray = [];
  // let idSuscriptor;
  // let idTipoSuscripcion;
  // const tipoSuscripcion = await TipoSuscripcion.find()
  //   .where("creador")
  //   .equals(req.usuario);
  // for (let i = 0; i < obtenerCantidadActivosTipoSuscripcion.length; i++) {
  //   idSuscriptor = obtenerCantidadActivosTipoSuscripcion[i]._id;
  //   // console.log(idSuscriptor);
  //   for (let m = 0; m < tipoSuscripcion.length; m++) {
  //     if ((idSuscriptor = tipoSuscripcion[m]._id)) {
  //       // console.log(tipoSuscripcion[m]._id);
  //       nuevoArray.push(tipoSuscripcion[m].nombre);
  //     }
  //   }
  //   console.log(nuevoArray);
  // }

  // const prueba = await Suscriptor.populate(
  //   obtenerCantidadActivosTipoSuscripcion,
  //   {
  //     path: "tipoSuscripcion._id",
  //     model: "TipoSuscripcion",
  //   }
  // );
  // console.log(prueba);

  try {
    res.json({
      suscriptoresActivos,
      suscriptoresDeudores,
      suscriptoresTotales,
      obtenerMontosTotalesPorMesPorCuota,
      obtenerCantidadCuotasPagasPorMes,
      obtenerCantidadActivosTipoSuscripcion,
      // prueba,
    });
  } catch (error) {
    console.log(error);
  }
};

const getEstadisticasPorFechaPersonalizada = async (req, res) => {
  const { fecha } = req.query;

  // console.log(fecha.toString());

  const nuevaFecha = new Date(fecha).toISOString();

  let HastaFechaPersonalizada = new Date(fecha);
  let DesdeFechaPersonalizada = new Date();
  DesdeFechaPersonalizada.setDate(HastaFechaPersonalizada.getDate() - 1);

  const obtenerUtilidadVentasHoy = await Pagos.aggregate([
    {
      $match: {
        $and: [
          { creador: req.usuario._id },
          {
            "pagoUnico.fechaPagoSuscripcion": {
              $gte: DesdeFechaPersonalizada,
              $lte: HastaFechaPersonalizada,
            },
          },
        ],
      },
    },
    {
      $group: {
        _id: "$pagoUnico.metodoPago",
        montoPagoSuscripcion: { $sum: "$pagoUnico.montoPagoSuscripcion" },
        cantidadCuotas: { $sum: 1 },
      },
    },
  ]);
  console.log("Nueva fecha: " + nuevaFecha, obtenerUtilidadVentasHoy);
  res.json({ obtenerUtilidadVentasHoy });
};

// const obtenerCuotasPagadasPorMes = await Suscriptor.aggregate([
//   {
//     $group: {
//       _id: {
//         VencimientoPorMes: { $month: "$fechas.fechaVencimientoSuscripcion" },
//       },
//       count: { $sum: 1 },
//     },
//   },
// ]);

// console.log(obtenerCuotasPagadasPorMes);

// SuscriptoresUnicosActivos.
// Pago de suscripciones del mes.
// Ganancias Bruta del mes (utilidad ingresos - gastos).

export {
  getEstadisticasEstadosSuscriptores,
  getEstadisticasPorFechaPersonalizada,
};
