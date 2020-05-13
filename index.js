const { ApolloServer } = require(`apollo-server`)

const typeDefs = `
  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }

  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    postedBy: User!
    taggedUsers: [User!]!
  }

  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
    inPhotos: [Photo!]!
  }

  input PostPhotoInput {
    name: String!
    category: PhotoCategory=PORTRAIT
    description: String
  }

  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }

  type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
  }
`

const users = [
  { "githubLogin": "mHattrup", "name": "hoge" },
  { "githubLogin": "gatrin", "name": "fuga" }
]

const photos = [
  {
    "id": "1",
    "name": "John",
    "description": "hogehoge",
    "category": "ACTION",
    "githubUser": "mHattrup"
  },
  {
    "id": "2",
    "name": "Kahn",
    "description": "fugafuga",
    "category": "SELFIE",
    "githubUser": "gatrin"
  },
  {
    "id": "3",
    "name": "hogefuga",
    "description": "fugafuga",
    "category": "SELFIE",
    "githubUser": "gatrin"
  }
]

const tags = [
  { "photoID": "1", "userID": "gatrin" },
  { "photoID": "2", "userID": "gatrin" },
  { "photoID": "2", "userID": "mHattrup" }
]

let _id = 0

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos
  },

  Mutation: {
    postPhoto(parent, args) {
      const newPhoto = {
        id: _id++,
        ...args.input
      }
      photos.push(newPhoto)
      return newPhoto
    }
  },

  Photo: {
    url: parent => `http://example.com/img/${parent.id}.jpg`,
    postedBy: parent => {
      return users.find(u => u.githubLogin === parent.githubUser)
    },
    taggedUsers: parent => tags.filter(tag => tag.photoID === parent.id)
                               .map(tag => tag.userID)
                               .map(userID => users.find(u => u.githubLogin === userID))
  },

  User: {
    postedPhotos: parent => {
      return photos.filter(p => p.githubUser === parent.githubLogin)
    },
    inPhotos: parent => tags.filter(tag => tag.userID === parent.id)
                            .map(tag => tag.photoID)
                            .map(photoID => photos.fing(p => p.id === photoID))
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server
  .listen()
  .then(({ url }) => console.log(`GraphQL Service running on ${url}`))