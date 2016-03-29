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
import _ from 'underscore'
import Firebase from 'firebase'

window.Backbone = Backbone
window._ = _
window.Firebase = Firebase

require('../bower_components/backbonefire/dist/backbonefire')

console.log(Backbone)
function app() {
    // start app
    // new Router()
    var ItemModel = Backbone.Model.extend({
        defaults: {
            dueDate: "none",
            done: false
        }
    })

    var TodoCollection = Backbone.Firebase.Collection.extend({
        // model: ItemModel,
        url: "https://todoabutterfly.firebaseio.com/tasks",
        autoSync:true
    })


    // var TaskList = Backbone.Model.extend({
    //     defaults: {
    //         tasks: new TodoCollection()
    //     },

    //     url: "https://todoabutterfly.firebaseio.com/halbert/lists/-KDvS9NUaLdFPGnI4RSi.json",

    //     parse: function(rawData) {
    //         this.get('tasks').add(rawData.tasks)
    //     }

    // })


    var TodoView = React.createClass({

        _addItem: function(task) {
            this.state.all.add({text: task, done:false})
            this._update()
        },

        _update: function(){
            this.setState({
                all: this.state.all,
                done: this.state.all.where({done:true}),
                undone: this.state.all.where({done:false}),
                showing: location.hash.substr(1)
            })
        },

        componentWillMount: function() {
            var self = this
            this.props.todoColl.on('sync',function(){self.forceUpdate()})
        },

        getInitialState: function() {
            return {
                all: this.props.todoColl,
                done: this.props.todoColl.where({done:true}),
                undone: this.props.todoColl.where({done:false}),
                showing: this.props.showing
            }
        },

        render: function() {
            
            var coll = this.state.all
            if (this.state.showing === "done") coll = this.state.done
            if (this.state.showing === "undone") coll = this.state.undone

            return (
                <div className="todoView">
                    <Tabs updater={this._update} showing={this.state.showing} />
                    <ItemAdder adderFunc={this._addItem}/>
                    <TodoList updater={this._update} todoColl={coll}/>
                </div>  
                )
        }
    })

    var Tabs = React.createClass({
        _genTab: function(tabType,i) {
            return <Tab updater={this.props.updater} key={i} type={tabType} showing={this.props.showing} />
        },

        render: function() {
            return (
                <div className="tabs">
                    {["all","done","undone"].map(this._genTab)}
                </div>
                )
        }
    })

    var Tab = React.createClass({
        _changeRoute: function() {
            location.hash = this.props.type
            this.props.updater()
        },

        render: function() {
            var styleObj = {}
            if (this.props.type === this.props.showing){
                styleObj.borderBottom = "#ddd"
            }

            return (
                <div onClick={this._changeRoute} style={styleObj} className="tab">
                    <p>{this.props.type}</p>
                </div>
                )
        }
    })

    var ItemAdder = React.createClass({

        _handleKeyDown: function(keyEvent) {
            if (keyEvent.keyCode === 13) {
                var guestName = keyEvent.target.value
                keyEvent.target.value = ''
                this.props.adderFunc(guestName)
            }
        },

        render: function() {
            return <input onKeyDown={this._handleKeyDown} />
        }
    })

    var TodoList = React.createClass({

        _makeItem: function(model,i) {
            
            return <Item key={i} updater={this.props.updater} itemModel={model} />
        },

        render: function() {
            return (
                <div className="todoList">
                    {this.props.todoColl.map(this._makeItem)}
                </div>
                )
        }
    })

    var Item = React.createClass({
        _toggleDone: function() {
            if (this.props.itemModel.get('done')) {
                this.props.itemModel.set({done: false})
            }
            else {
                this.props.itemModel.set({done: true})
            }
            this.props.updater()
        },

        render: function() {
            var buttonFiller = this.props.itemModel.get('done') ? "\u2713" : ' '                 

            return (
                <div className="todoItem">
                    <p>{this.props.itemModel.get('text')}</p>
                    <button onClick={this._toggleDone}>{buttonFiller}</button>
                </div>
                )
        }
    })

    var TodoRouter = Backbone.Router.extend({
        routes: {
            "undone": "showUndone",
            "done": "showDone",
            "*default": "home"
        },

        showDone: function(){
            
            DOM.render(<TodoView showing="done" todoColl={new TodoCollection()}/>,document.querySelector('.container'))
        },

        home: function() {
            console.log('routing home')
            var listColl = new TodoCollection()
            console.log(listColl)
            // $.ajax(
            //     {type: 'POST', // Use POST with X-HTTP-Method-Override or a straight PUT if appropriate.
            //     dataType: 'json', // Set datatype - affects Accept header
            //     url: tc.url, // A valid URL
            //     headers: {"X-HTTP-Method-Override": "PUT"}, // X-HTTP-Method-Override set to PUT.
            //     data: '["a","b","crustycrystals"]' // Some data e.g. Valid JSON as a string
            // })

            DOM.render(<TodoView showing="all" todoColl={listColl}/>,document.querySelector('.container'))
        },

        showUndone: function() {
            DOM.render(<TodoView showing="undone" todoColl={new TodoCollection()}/>,document.querySelector('.container'))            
        },

        initialize: function() {
            Backbone.history.start()
        }
    })

    var rtr = new TodoRouter()
    // $.getJSON("https://todoabutterfly.firebaseio.com/halbert/lists/justin.json").then((data)=>{console.log(data)})
}

app()
