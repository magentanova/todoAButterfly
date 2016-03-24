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
    var ItemModel = Backbone.Model.extend({

        defaults: {
            dueDate: "none",
            done: false
        },

        initialize: function(taskName) {
            this.set({task: taskName})
        }
    })

    var TodoCollection = Backbone.Collection.extend({
        model: ItemModel
    })

    var TodoView = React.createClass({

        _addItem: function(task) {
            this.state.all.add(new ItemModel(task))
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
                this.props.adderFunc(guestName)
                keyEvent.target.value = ''
            }
        },

        render: function() {
            return <input onKeyDown={this._handleKeyDown} />
        }
    })

    var TodoList = React.createClass({

        _makeItem: function(model,i) {
            console.log(model, i)
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
                    <p>{this.props.itemModel.get('task')}</p>
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
            console.log('showing done')
            DOM.render(<TodoView showing="done" todoColl={new TodoCollection()}/>,document.querySelector('.container'))
        },

        home: function() {
            DOM.render(<TodoView showing="all" todoColl={new TodoCollection()}/>,document.querySelector('.container'))
        },

        showUndone: function() {
            DOM.render(<TodoView showing="undone" todoColl={new TodoCollection()}/>,document.querySelector('.container'))            
        },

        initialize: function() {
            Backbone.history.start()
        }
    })

    var pr = new TodoRouter()

}

app()
