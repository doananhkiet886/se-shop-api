'use strict'

const { Cart, CartDetail, Product } = require('~/api/v1/models')
const { getProductById } = require('~/api/v1/repositories/product.repo')
const { getFullCart } = require('~/api/v1/repositories/cart.repo')
const { getCartByCartIdProductId } = require('~/api/v1/repositories/cart.detail.repo')
const ApiError = require('~/core/api.error')
const { StatusCodes, ReasonPhrases } = require('http-status-codes')

const createCart = async ({ userId }) => {
  try {
    return await Cart.create({ userId })
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, ReasonPhrases.INTERNAL_SERVER_ERROR)
  }
}

const getAllFullCarts = async () => {
  const fullCarts = await Cart.findAll({
    attributes: ['id', 'userId'],
    include: [
      {
        model: CartDetail,
        as: 'products',
        attributes: ['quantity'],
        include: [{
          model: Product,
          as: 'product',
          attributes: ['name', 'description', 'imageUrl', 'price']
        }]
      }
    ]
  })

  return fullCarts
}

const getFullCartByUserId = async (userId) => {
  const fullCart = await Cart.findOne({
    where: { userId },
    attributes: ['id'],
    include: [
      {
        model: CartDetail,
        as: 'products',
        attributes: ['quantity'],
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'description', 'imageUrl', 'price']
        }]
      }
    ]
  })
  if (!fullCart) throw new ApiError(StatusCodes.NOT_FOUND, 'No carts found')
  return fullCart
}

const getFullCartById = async (id) => {
  const fullCart = await Cart.findOne({
    where: { id },
    attributes: ['id', 'userId'],
    include: [
      {
        model: CartDetail,
        as: 'products',
        attributes: ['quantity'],
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'description', 'imageUrl', 'price']
        }]
      }
    ]
  })
  if (!fullCart) throw new ApiError(StatusCodes.NOT_FOUND, 'Not found cart')
  return fullCart
}

const addProductToCart = async ({ userId, cartId, productId, quantity }) => {
  const foundCart = await getFullCart({ cartId, userId })
  if (!foundCart) throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)

  const foundProduct = await getProductById(productId)
  if (!foundProduct) throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)

  const foundCartDetail = await getCartByCartIdProductId({ cartId, productId })

  if (foundCartDetail) {
    const isExceedStockQuantity = foundProduct.stockQuantity < (quantity + foundCartDetail.quantity)
    if (isExceedStockQuantity) throw new ApiError(StatusCodes.BAD_REQUEST, 'Quantity in stock is not enough')
    await foundCartDetail.update({ quantity: foundCartDetail.quantity + quantity })
  } else {
    const isExceedStockQuantity = foundProduct.stockQuantity < quantity
    if (isExceedStockQuantity) throw new ApiError(StatusCodes.BAD_REQUEST, 'Quantity in stock is not enough')
    await CartDetail.create({ cartId, productId, quantity })
  }

  const fullCart = await getFullCartById(cartId)
  return {
    id: fullCart.id,
    products: fullCart.products
  }
}

const reduceQuantityProduct = async ({ userId, cartId, productId, quantity }) => {
  const foundCart = await getFullCart({ cartId, userId })
  if (!foundCart) throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)

  const foundProduct = await getProductById(productId)
  if (!foundProduct) throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)

  const foundCartDetail = await getCartByCartIdProductId({ cartId, productId })
  if (!foundCartDetail) throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)

  const isExceedReductionQuantity = foundCartDetail.quantity < quantity
  if (isExceedReductionQuantity) throw new ApiError(StatusCodes.BAD_REQUEST, 'Exceeded reduction quantity')

  await foundCartDetail.update({ quantity: foundCartDetail.quantity - quantity })

  const fullCart = await getFullCartById(cartId)
  return {
    id: fullCart.id,
    products: fullCart.products
  }
}

module.exports = {
  createCart,
  getFullCartById,
  getFullCartByUserId,
  getAllFullCarts,
  addProductToCart,
  reduceQuantityProduct
}