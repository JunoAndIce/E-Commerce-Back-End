const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  Product.findAll({
    attributes: ['id', 'product_name', 'price', 'stock'],
    include: [
      {
        model: Category,
        attributes: ['category_name']
      },
      {
        model: Tag,
        attributes: ['tag_name']
      }
    ]
  })
    .then(products => res.json(products))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// get one product
router.get('/:id', (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  Product.findOne({
    where: {
      id: req.params.id
    },
    attributes: ['id', 'product_name', 'price', 'stock'],
    include: [
      {
        model: Category,
        attributes: ['category_name']
      },
      {
        model: Tag,
        attributes: ['tag_name']
      }
    ]
  })
    .then(products => {
      if (!products) {
        res.status(404).json({message: 'No products matches this ID. Have you seeded your db?'});
        return;
      }
      res.json(products);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// create new product
router.post('/', (req, res) => {
  Product.create({
    product_name: req.body.product_name,
    price: req.body.price,
    stock: req.body.stock,
    category_id: req.body.category_id,
    tagIds: req.body.tagIds
    })
    .then((products) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const tagIDArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: products.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(tagIDArr);
      }
      // if no product tags, just respond
      res.status(200).json(products);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    // 
    .then((products) => {
      // get list of current tag_ids and map out only their tag_id's
      const currentTagIDs = products.map(({ tag_id }) => tag_id);
      // create a new const that will be any tags that aren't already in the db
      const newTagIDs = req.body.tagIds
        .filter((tag_id) => !currentTagIDs.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // Get a new const that will equal the id of the product tags
      const oldTagIDs = products
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      
      return Promise.all([
        // Destroy all old product tags
        ProductTag.destroy({ where: { id: oldTagIDs } }),
        // Create new Product tags
        ProductTag.bulkCreate(newTagIDs),
      ]);
    })
    .then((updatedProducts) => res.json(updatedProducts))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
  Product.destroy({
    where: {
      id: req.params.id
    }
  })
  .then(products => {
    if (!products) {
      rs.status(404).json({message: 'No products matches this ID. Have you seeded your db?'});
      return;
    }
    res.json(products);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

module.exports = router;
