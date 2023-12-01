// 创建一个函数来处理页面宽度的更新
function updateWidth() {
    // 获取 body 元素的原生 DOM
    var bodyNode = d3.select("body").node();

    // 获取当前页面宽度
    var clientWidth = bodyNode.clientWidth;

    // 在这里可以对宽度进行进一步处理或者更新其他相关的元素
    // 例如，更新图表的宽度等
    console.log("当前页面宽度：" + clientWidth);
    return clientWidth
}


/* 纯文本=>统计词频 */
function getWordCounts(text) {
    const segmenter = new Intl.Segmenter("zh", { granularity: "word" });
    const words = segmenter.segment(text);
    
    const wordCounts = {};
    for (let { segment } of words) {
        const word = segment;
        if (/[\p{P}\p{S}]/u.test(word)) { continue}  // 过滤标点符号
        if (wordCounts[word] === undefined) {
        wordCounts[word] = 1;
        } else {
        wordCounts[word]++;
        }
    }
    // 转换成词频统计的格式
    return Object.keys(wordCounts).map(key => ({ text: key, size: wordCounts[key] }));
}

/* （纯文本，展示频数阈值，svg载体）=>生成词云布局 */
function build_wordcloud(words,threshold,chosen_svg,colorScale) {
    let count_list= getWordCounts(words)
    count_list.forEach(d=>{
        d.count=d.size
    })
    const layout = d3.layout.cloud()
        .size([width, height])
        .words(count_list.filter(d => d.size >= threshold)) // 只展示频率高于阈值的词
        .padding(3) //内边距
        .rotate(0)
        .spiral("archimedean") // archimedean, rectangular
        .font("Impact")
        .fontSize(d => Math.sqrt(d.size+2) * 20) // 根据词频调整字体大小
        .on("end", d=>draw(chosen_svg,d,colorScale));
    layout.start();
}

/* （svg载体，词频数组）=> 绘制词云 */
function draw(chosen_svg,words,colorScale) {
    chosen_svg.selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", d => `${d.size}px`)
        .style("font-family", "Impact")
        .attr("text-anchor", "middle")
        .style("fill", function(d, i) { return colorScale(i); })//颜色
        .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text(d => d.text)
        .on("mouseover", function(d,i) {
            d3.select(this).transition().duration(200).style("font-size", `${i.size+5}px`);
            // 创建动态信息展示框
            tooltip.style("visibility", "visible")
            tooltip.html(`${i.text}--诗中频数：${i.count}`).style("left", (event.pageX+ 50) + "px").style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", (event,d) => {
            // 在鼠标移动时，更新信息展示框的位置
            tooltip.style("left", (event.pageX+ 10) + "px").style("top", (event.pageY+ 10 ) + "px");
        })
        .on("mouseout", function(d,i) {
            d3.select(this).transition()
            .duration(200)
            .style("font-size", `${i.size}px`);
            tooltip.style("visibility", "hidden")
        })
        .style("user-select", "none")  //不许拖拽选中;
}

/* 两个时间范围=>1(有交集) */
function doRangesOverlap(range1, range2) {
    return (range1[0] <= range2[1] && range1[1] >= range2[0]);
}

/* 两个时间范围=>他们的并集 */
function mergeTimeRanges(range1, range2) {
    return [Math.min(range1[0], range2[0]), Math.max(range1[1], range2[1])];
}


/* 创建颜色图例(横向) */
function build_legend(chosen_svg,translate,colorRange,text,shape='rect',rect_length= 30,fontSize = 10,legendSpacing=3) {
    // rect_length: 图例矩形的长
    // shape: 图例形状
    // fontSize: 文字大小
    // legendSpacing: 元素之间的间距
    // colorRange: 两端颜色
    // text: 两端文字

    // 创建唯一的渐变id
    var uniqueId = "legendGradient-" + Math.random().toString(36).slice(2, 11); // 创建一个随机的唯一id
    direction=["0%","0%","100%","0%"]
    var defs = chosen_svg.append("defs");
    var linearGradient = defs.append("linearGradient")
        .attr("id", uniqueId)
        .attr("x1", direction[0])
        .attr("y1", direction[1])
        .attr("x2", direction[2])
        .attr("y2", direction[3]);

    linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorRange[0]); // 开始颜色
    linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorRange[1]); // 结束颜色

    var legend = chosen_svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${translate[0]},${translate[1]})`)
    .style("user-select", "none")  //不许拖拽选中;

    var legendfig = legend.selectAll('.legend-'+shape)
    .data([0])
    .enter()
    .append(shape)
    .attr('class', 'legend-'+shape)
    .style('fill', "url(#" + uniqueId + ")"); // 使用渐变颜色;
    // console.log(shape)
    if (shape=='rect'){
        legendSize=[rect_length,fontSize]
        legendfig.attr('width', legendSize[0])
        .attr('height', legendSize[1])
        .attr('x',  0)
        .attr('y',  0)
    }
    else if(shape=='circle'){
        legendSize=[fontSize,fontSize]
        legendfig.attr('r', fontSize/2)
        .attr('cx', legendSize[0]/2)
        .attr('cy',  fontSize/2)
    }

    var legendData = ["经过次数少", "经过次数多"];  // 图例的标签

    legend.append('text').text(text[1])
    .attr('class', 'legend-text')
    .attr('x', legendSize[0] + legendSpacing)
    .attr('y',  legendSize[1] )
    .attr('font-size',fontSize)
    
    legend.append('text').text(text[0])
    .attr('class', 'legend-text')
    .attr("text-anchor", "end") // 或 "middle" 或 "end"
    .attr('x', - legendSpacing)
    .attr('y',  legendSize[1] )
    .attr('font-size',fontSize)
}
