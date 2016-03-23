// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"

//
// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
import fetch from "isomorphic-fetch"

// universal utils: cache, fetch, store, resource, fetcher, router, vdom, etc
// import * as u from 'universal-utils'

// the following line, if uncommented, will enable browserify to push
// a changed fn to you, with source maps (reverse map from compiled
// code line # to source code line #), in realtime via websockets
// -- browserify-hmr having install issues right now
// if (module.hot) {
//     module.hot.accept()
//     module.hot.dispose(() => {
//         app()
//     })
// }

import DOM from 'react-dom'
import React, {Component} from 'react'
import Backbone from 'backbone'

function app() {
    // start app
    // new Router()
    var GuestModel = Backbone.Model.extend({

        defaults: {
            partySize: 1
        },

        initialize: function(newName) {
            this.set({name: newName})
        }
    })

    var GuestCollection = Backbone.Collection.extend({
        model: GuestModel
    })

    var PartyView = React.createClass({

        _addGuest: function(name) {
            this.state.guestColl.add(new GuestModel(name))
            this.setState({
                guestColl: this.state.guestColl
            })
        },

        getInitialState: function() {
            return {
                guestColl: this.props.guestColl
            }
        },

        render: function() {
            return (
                <div className="partyView">
                    <GuestAdder adderFunc={this._addGuest}/>
                    <GuestList guestColl={this.state.guestColl}/>
                </div>  
                )
        }
    })

    var GuestAdder = React.createClass({

        _handleKeyDown: function(keyEvent) {
            if (keyEvent.keyCode === 13) {
                var guestName = keyEvent.target.value
                this.props.adderFunc(guestName)
            }
        },

        render: function() {
            return <input onKeyDown={this._handleKeyDown} />
        }
    })

    var GuestList = React.createClass({

        _makeGuest: function(model) {
            return <Guest guestModel={model} />
        },

        render: function() {
            return (
                <div className="guestList">
                    {this.props.guestColl.map(this._makeGuest)}
                </div>
                )
        }
    })

    var Guest = React.createClass({
        render: function() {
            return <p>{this.props.guestModel.get('name')}</p>
        }
    })

    var PartyRouter = Backbone.Router.extend({
        routes: {
            "*default": "home"
        },

        home: function() {
            DOM.render(<PartyView guestColl={new GuestCollection()}/>,document.querySelector('.container'))
        },

        initialize: function() {
            Backbone.history.start()
        }
    })

    var pr = new PartyRouter()

}

app()
