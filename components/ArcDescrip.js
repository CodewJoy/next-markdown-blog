const emoji = require('node-emoji');

export default function ArcDescrip({ date, readTime }) {
    const coffee = emoji.get('coffee');
    return (<small>{date} • {coffee}{coffee}{coffee} {readTime} read</small>);
};