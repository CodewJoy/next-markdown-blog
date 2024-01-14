const generateEmoticons = (count) => {
    const emoticon = '☕';
    // 確保 count 在 1 到 5 之間
    count = Math.max(1, Math.min(5, count));
    let result = '';
    for (let i = 0; i < count; i++) {
      result += emoticon;
    }
    return result;
};
export default function ArcDescrip({ date, readTime, difficultyLevel }) {
    return (<small>{date} • {generateEmoticons(Number(difficultyLevel))} • {readTime} read</small>);
};