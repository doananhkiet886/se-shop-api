'use strict'

const { Cart, CartDetail, Product } = require('~/api/v1/models')
const cartDetailRepo = require('~/api/v1/repositories/cart.detail.repo')
const cartService = require('~/api/v1/services/cart.service')

const getFullCartByProductIds = async ({ cartId, userId, productIds = [] }) => {
  return await Cart.findOne({
    where: { userId, id: cartId },
    attributes: ['id'],
    include: [
      {
        model: CartDetail,
        as: 'products',
        attributes: ['quantity'],
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'description', 'imageUrl', 'price'],
          where: { id: productIds }
        }]
      }
    ]
  })
}

const getFullCart = async ({ cartId, userId }) => {
  return await Cart.findOne({
    where: { userId, id: cartId },
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
}

const addProductsNotExistsInCart = async ({ userId, cartId, orderProducts = [] }) => {
  return await Promise.all(orderProducts.map(async (orderProduct) => {
    const foundCartDetail = await cartDetailRepo.getCartByCartIdProductId({ cartId, productId: orderProduct.productId })
    if (!foundCartDetail) {
      return await cartService.addProductToCart({
        userId,
        cartId,
        productId: orderProduct.productId,
        quantity: orderProduct.quantity
      })
    }
  }))
}

module.exports = {
  getFullCartByProductIds,
  getFullCart,
  addProductsNotExistsInCart
}