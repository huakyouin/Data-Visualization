import json

# 读取JSON文件
with open('ci.song.1000.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# 提取苏轼的词
su_shi_poems = []
for poem in data:
    if "author" in poem and poem["author"] == "苏轼":
        su_shi_poems.append(poem)

# 构建包含苏轼词的新JSON对象
su_shi_data = {
    "author": "苏轼",
    "poems": su_shi_poems
}

# 将苏轼的词写入新的JSON文件
with open('su_shi_poems.json', 'w', encoding='utf-8') as file:
    json.dump(su_shi_data, file, ensure_ascii=False, indent=4)