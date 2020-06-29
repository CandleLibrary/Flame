import mongodb from "mongodb";
import lantern from "@candlefw/lantern";


function database(server) : Array<Disp> {

    //Connect to database server
    const MongoClient = mongodb.MongoClient;

    const url = "mongodb://localhost:27017";

    const dbName = "test";

    const client = new MongoClient(url);

    let db = null;

    client.connect(err => {
        if (!err) {
            console.log("Connected to MongoDB server");

            db = client.db(dbName);

        } else
            console.log(err);
    });

    return [
        {
            name: "MONGO DATABASE",
            //MIME: "application/javascript",
            respond: async function (tools) {
                console.log("TESTS");

            },

            keys: [
                { ext: server.ext.all, dir: "/db/*" },
            ]
        },
    ];

}
export default database;
