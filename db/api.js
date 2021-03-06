var knex = require('./knex');

module.exports = {
  getAllIndustries: function() {
    return knex('industry').select();
  },
  getAllClasses: function() {
    return knex('class').select();
  },
  getAllCities: function() {
    return knex('business').select('city').distinct('city');
  },
  findAllBusinessesAndIndustry: function(type) {
    return knex('business').select()
      .join('industry', function() {
        this.on('business.industry_id', '=', 'industry.id');
      });
  },

  findAllOwners: function() {
    return knex('owner').select()
      .then((returnedOwners) => {
        return returnedOwners.map((owner) => {
          return this.findClassesById(owner.id)
            .then(function(classes) {
              owner.classes = classes;
              return owner;
            })
        })
      }).then(function(data) {
        return Promise.all(data);
      });
  },


  // listAuthorsWithBooks: function() {
  //   return this.getAllAuthors()
  //     .then((returnedAuthors) => {
  //       return returnedAuthors.map((author) => {
  //         return this.getBooksByAuthorId(author.id)
  //           .then(function(books) {
  //             author.books = books;
  //             return author;
  //           });
  //       });
  //     }).then(function(data) {
  //       return Promise.all(data);
  //     });
  // },


  findEntrepreneurById: function(id) {
    return knex('owner').select().where('owner.id', '=', id);
  },
  deleteEntrepreneurById: function(entrepreneurId) {
    return knex('class_owner')
      .del()
      .where('class_owner.owner_id', '=', entrepreneurId)
      .then(function() {
        return knex('business_owner')
          .del()
          .where('business_owner.owner_id', '=', entrepreneurId)
          .then(function() {
            return knex('owner')
              .del()
              .where('owner.id', '=', entrepreneurId);
          })
      })
  },

  findClassesById: function(id) {
    return knex('owner').select("class.id as class_id", "class_owner.did_graduate", "class_owner.year", "class_owner.semester", "class.name")    
      .join('class_owner', function() {
        this.on('owner.id', '=', 'class_owner.owner_id');
      })
      .join('class', function() {
        this.on('class.id', '=', 'class_owner.class_id')
      })
      .where('owner.id', '=', id);
  },

  findBusinessesAndOwners: function() {
    return knex('business')
      .select()
      .join('industry', function() {
        this.on('business.industry_id', '=', 'industry.id');
      })
      .join('business_owner', function() {
        this.on('business.id', '=', 'business_owner.business_id');
      })
      .join('owner', function() {
        this.on('business_owner.owner_id', '=', 'owner.id');
      });
  },
  findBusinessesAndOwnersById: function(id) {
    return knex('business')
      .select()
      .join('industry', function() {
        this.on('business.industry_id', '=', 'industry.id');
      })
      .join('business_owner', function() {
        this.on('business.id', '=', 'business_owner.business_id');
      })
      .join('owner', function() {
        this.on('business_owner.owner_id', '=', 'owner.id');
      })
      .where('business.id', '=', id);

  },

  findBusinessByEntrepreneurId: function(id) {
    return knex('business').select()
      .join('business_owner', function() {
        this.on('business.id', '=', 'business_owner.business_id');
      })
      .where('business_owner.owner_id', '=', id)
  },

  getCommentsById: function(id) {
    // console.log("hitting function");
    return knex('business')
      .select('business.id', 'internal_notes.business_id', 'internal_notes.account_id', 'account.username', 'internal_notes.notes')
      .join('internal_notes', function() {
        this.on('business.id', '=', 'internal_notes.business_id');
      })
      .join('account', function() {
        this.on('internal_notes.account_id', '=', 'account.id');
      })
      .where('business.id', '=', id);
  },
  updateBusiness: function(body) {
    return knex('business')
      .update(body)
      .where('business.id', '=', body.id);
  },
  updateEntrepreneur: function(body) {
    console.log('updating owner');
    return knex('owner')
      .update(body)
      .where('owner.id', '=', body.id);
  },
  addNote: function(note) {
    return knex('internal_notes')
      .insert(note)
      .where('business_id', '=', note.business_id)
  },

  addBusinessById: function(entrepreneurId, body) {
    console.log("This is in the function", entrepreneurId);
    return knex('business').insert(body).returning('id').then(function(id) {
      console.log(id);
      return knex('business_owner').insert({
        'owner_id': entrepreneurId,
        'business_id': id[0]
      })
    })
  },
  addBusiness: function(body) {
    return knex('business').insert(body).returning('id')
  },
  deleteBusinessById: function(businessId) {
    return knex('internal_notes')
      .del()
      .where('internal_notes.business_id', '=', businessId)
      .then(function() {
        return knex('business_owner')
          .del()
          .where('business_owner.business_id', '=', businessId)
          .then(function() {
            return knex('business')
              .del()
              .where('business.id', '=', businessId);
          })
      })
  },
  addOwner: function(body) {
    return knex('owner').insert(body).returning('id')
  },
  addBusinessOwner: function(businessId, ownerId) {
    return knex('business_owner').insert({
      owner_id: ownerId,
      business_id: businessId
    })
  },
  addClassOwner: function(id, info) {
    console.log("hitting this function");
    return knex('class_owner').insert({
      owner_id: id,
      class_id: info.class_id,
      did_graduate: info.did_graduate,
      year: info.year,
      semester: info.semester
    })
  }
};
