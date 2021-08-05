const { Sequelize, DataTypes } = require('sequelize')
const message = require('../utils/Message')
require('dotenv').config()
const sequelize = new Sequelize(process.env.DATABASE_URL)

const City = sequelize.define('City', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    detail: {
        type: DataTypes.STRING(1000),
        allowNull: false
    }
}, {
})

const Group = sequelize.define('Group', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
})

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pwd: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    photo: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "../../public/DEFAULT.png"
    }
})
User.belongsTo(City)
City.hasMany(User)

User.belongsTo(Group)
Group.hasMany(User)

const Ticket = sequelize.define('Ticket', {
    title: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    content: {
        type: DataTypes.STRING(40000),
        allowNull: false
    },
    rate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    type: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    priority: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    lat: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    long: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    followedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
})
Ticket.belongsTo(User, {as: 'ticketAuthor', foreignKey : 'ticketAuthorId'})
User.hasMany(Ticket, {as: 'ticketAuthor', foreignKey: 'ticketAuthorId'})
Ticket.belongsTo(City)
City.hasMany(Ticket)

const Reply = sequelize.define('Reply', {
    content: {
        type: DataTypes.STRING(40000),
        allowNull: false
    }
})
Reply.belongsTo(User, {as: 'replyAuthor', foreignKey: 'replyAuthorId'})
User.hasMany(Reply, {as: 'replyAuthor', foreignKey: 'replyAuthorId'})
Reply.belongsTo(Ticket)
Ticket.hasMany(Reply)

const Follow = sequelize.define('Follow', {})
Ticket.belongsToMany(User, {as: 'follower', through: Follow})
User.belongsToMany(Ticket, {as: 'follower', through: Follow})

const testConnection = async() => {
    try {
        await sequelize.authenticate();
        return message.successMsg(null, "Connection has been established successfully")
    } catch (error) {
        console.error('Unable to connect to the database:' + error);
        return message.failMsg('Unable to connect to the database:' + error);
    }
}

const forceSync = async() => {
    try {
        await sequelize.sync({force: true});
        console.log("Force sync finished.")
        await City.create({
            name: 'San Francisco',
            detail: 'San Francisco, officially the City and County ' +
                'of San Francisco, is a cultural, commercial, and ' +
                'financial center in Northern California. San ' +
                'Francisco is the 16th most populous city in the ' +
                'United States, and the fourth most populous in ' +
                'California, with 881,549 residents as of 2019.' +
                '<br> - San Francisco in Wikipedia'
        })
        await City.create({
            name: 'Los Angeles',
            detail: 'Los Angeles , officially the City of Los Angeles and often ' +
                'abbreviated as L.A., is the largest city in California. It has ' +
                'an estimated population of nearly 4 million, and is the ' +
                'second-largest city in the United States, after New York ' +
                'City, and the third-largest city in North America, after ' +
                'Mexico City and New York City.' +
                '<br> - Los Angeles City in Wikipedia'
        })
        await City.create({
            name: 'San Jose',
            detail: 'San Jose, officially San José is the cultural, financial, ' +
                'and political center of Silicon Valley, and the largest city ' +
                'in Northern California by both population and area.' +
                '<br> - San Jose City in Wikipedia'
        })
        await Group.create({
            name: 'Admin'
        })
        await Group.create({
            name: 'Verified User'
        })
        await Group.create({
            name: 'User'
        })
    } catch (error) {
        console.error('Unable to force sync:' + error);
    }
}

module.exports = {
    City,
    Group,
    User,
    Ticket,
    Reply,
    Follow,
    forceSync,
    testConnection
}

